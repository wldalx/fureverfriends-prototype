import axios from "axios"
import { toast } from 'react-toastify'
import { useState, useRef, useEffect } from "react"
import { Buffer } from 'buffer/' // trailing slash required

import { PiPawPrint } from "react-icons/pi"
import { MdOutlineDeleteForever } from "react-icons/md"
import { IoMdAdd } from "react-icons/io"
import { FaRegSave, FaRegEdit } from "react-icons/fa"

import { useAuth } from "../../middleware/AuthMiddleware.jsx"
import SITTING from '../../enums/SittingType.js'
import PET from '../../enums/PetType.js'
import REQUESTS from "../../utils/RequestRoutes.js"
import SittingType from "../../enums/SittingType.js"
import RequestRoutes from "../../utils/RequestRoutes.js"
import InfoComponent from "../general/InfoComponent.jsx"


export default function OfferTab() {

    const auth = useAuth();
    const offerForm = useRef();

    const Mode = {
        VIEW: "VIEW",
        CREATE: "CREATE",
        EDIT: "EDIT"
    };
    const [formMode, setFormMode] = useState(Mode.VIEW);

    const [petTypes, setPetTypes] = useState([]);
    const [sittingTypes, setSittingTypes] = useState([]);
    const [priceDayCare, setPriceDayCare] = useState(0);
    const [priceDropInVisits, setPriceDropInVisits] = useState(0);
    const [priceHomesitting, setPriceHomesitting] = useState(0);
    const [priceOvernightStay, setPriceOvernightStay] = useState(0);
    const [description, setDescription] = useState("");
    const [shortDescription, setShortDescription] = useState("");
    const [iban, setIban] = useState(auth.iban ? auth.iban : "");
    const [galleryImages, setGalleryImages] = useState([]);

    // init all vars on each change of auth.offer
    function loadOfferFromDB() {
        setIban(auth.iban ? auth.iban : "")

        if (auth.offer) {
            axios.get(REQUESTS.OFFER + "/" + auth.offer).then(res => {
                setPetTypes(res.data.petTypes)

                const priceClasses = res.data.priceClasses;
                priceClasses.forEach(priceClass => {
                    if (priceClass.type === SittingType.DAYCARE)
                        setPriceDayCare(priceClass.price)
                    else if (priceClass.type === SittingType.DROPIN_VISIT)
                        setPriceDropInVisits(priceClass.price)
                    else if (priceClass.type === SittingType.HOUSESITTING)
                        setPriceHomesitting(priceClass.price)
                    else if (priceClass.type === SittingType.OVERNIGHT_STAY)
                        setPriceOvernightStay(priceClass.price)
                })
                setSittingTypes(priceClasses.map(priceClass => priceClass.type))

                setDescription(res.data.description)
                setShortDescription(res.data.shortDescription)
                setGalleryImages(res.data.gallery.map(image => ({
                    type: image.type,
                    data: Buffer(image.data).toString()
                })))
            }).catch(() => {
                toast.error("An error occured while fetching the offer. Please try again later.")
            })
        } else {
            setPetTypes([])
            setSittingTypes([])
            setPriceDayCare(0)
            setPriceDropInVisits(0)
            setPriceHomesitting(0)
            setPriceOvernightStay(0)
            setDescription("")
            setShortDescription("")
            setGalleryImages([])
        }
    }
    useEffect(loadOfferFromDB, [auth.offer, auth.iban])


    // Component
    function EmptyOffer() {
        return (
            <div className="flex flex-col m-4 items-center space-y-4">
                <span>You have not created an offer yet.</span>
                <button className="text-gray-300 bg-emerald-900 hover:bg-emerald-950 rounded-full px-4 py-2 h-max w-max text-lg duration-200 ml-auto mr-auto disabled:bg-gray-700"
                    onClick={() => setFormMode(Mode.CREATE)}>
                    <span className="flex items-center">Create Offer</span>
                </button>
            </div>
        )
    }

    // Component
    function OfferForm() {

        // user submits offer
        function handleSubmit(event) {
            event.preventDefault();

            if (sittingTypes.length < 1 || petTypes.length < 1) {
                toast.error("Your offer must include at least one sitting type and one pet type to be submitted.")
                return
            }

            let priceClasses = [];
            sittingTypes.forEach(sittingType => {
                if (sittingType === SITTING.DAYCARE)
                    priceClasses.push({
                        type: sittingType,
                        price: priceDayCare
                    })
                else if (sittingType === SITTING.DROPIN_VISIT)
                    priceClasses.push({
                        type: sittingType,
                        price: priceDropInVisits
                    })
                else if (sittingType === SITTING.HOUSESITTING)
                    priceClasses.push({
                        type: sittingType,
                        price: priceHomesitting
                    })
                else if (sittingType === SITTING.OVERNIGHT_STAY)
                    priceClasses.push({
                        type: sittingType,
                        price: priceOvernightStay
                    })
            })

            if(formMode === Mode.CREATE) {

                axios.post(REQUESTS.OFFER, {
                    petTypes: petTypes,
                    priceClasses: priceClasses,
                    gallery: galleryImages,
                    description: description,
                    shortDescription: shortDescription,
                    offerByUser: auth.userId
                }).then(res => {
                    if (res.status === 200) {
                        setPetTypes([])
                        setSittingTypes([])
                        setGalleryImages([])
                        setDescription("")
                        setShortDescription("")
                        setPriceDayCare(0)
                        setPriceDropInVisits(0)
                        setPriceHomesitting(0)
                        setPriceOvernightStay(0)

                        axios.put(RequestRoutes.USER + "/" + auth.userId, {
                            iban: iban
                        }).then(() => {
                            setFormMode(Mode.VIEW);
                            auth.refreshUserInformation()
                            toast.success("Offer created successfully.", {
                                theme: "colored",
                                style: { backgroundColor: "rgb(110 231 183)" }
                            })
                        }).catch(() => {
                            toast.error("An error occured while updating your IBAN. Please try again later.");
                        })
                    }
                }).catch(() => {
                    toast.error("An error occured while posting the offer. Please try again later.");
                })

            } else if(formMode === Mode.EDIT) {

                axios.put(REQUESTS.OFFER + "/" + auth.offer, {
                    petTypes: petTypes,
                    priceClasses: priceClasses,
                    description: description,
                    shortDescription: shortDescription,
                    gallery: galleryImages
                }).then(() => {
                    setFormMode(Mode.VIEW)
                    toast.success("Offer updated successfully.", {
                        theme: "colored",
                        style: { backgroundColor: "rgb(110 231 183)" }
                    })
                }).catch(() => {
                    toast.error("An error occured while updating the offer. Please try again later.")
                })

            }
        }

        function handleDeleteOffer(event) {
            event.preventDefault()
    
            axios.delete(RequestRoutes.OFFER + "/" + auth.offer).then(() => {
                setFormMode(Mode.VIEW);
                auth.refreshUserInformation()
                toast.success("Offer deleted successfully.", {
                    theme: "colored",
                    style: { backgroundColor: "rgb(110 231 183)" }
                })
            }).catch(() => {
                toast.error("An error occured while deleting the offer. Please try again later.");
            })
        }


        return (
            <div className="flex flex-col m-4 items-center space-y-4">
                <form className="space-y-4 flex flex-col items-center" onSubmit={event => handleSubmit(event)} ref={offerForm}>
                    <div className="flex flex-row justify-center w-full space-x-2">
                        <label>Preferred Pet Types:
                            <InfoComponent>
                                Our application allows you to specify the type of pet you need care for. You can choose from the following options:<br />
                                - <b>Dog</b>: Select this if you need care for a dog.<br />
                                - <b>Cat</b>: Select this if you need care for a cat.<br />
                                - <b>Bird</b>: Select this if you need care for a bird.<br />
                                - <b>Aquarium</b>: Select this if you need care for fish or other aquatic pets.<br />
                                - <b>Reptile</b>: Select this if you need care for reptiles such as snakes or lizards.<br />
                                - <b>Rodent</b>: Select this if you need care for small mammals like hamsters or guinea pigs.<br />
                                - <b>Other</b>: Select this if your pet doesn't fit into the above categories. You can provide more details later.
                            </InfoComponent>
                        </label>
                        <ul className='flex flex-col w-full rounded-md border-0 py-4 pl-10 pr-2 text-black ring-1 ring-gray-400 text-sm space-y-4 justify-center' id="petType">
                            {[PET.DOG, PET.CAT, PET.BIRD, PET.AQUARIUM, PET.REPTILE, PET.RODENT, PET.OTHER].map(type =>
                                <li key={type} className="flex items-center">
                                    <input type="checkbox"
                                        disabled={ formMode === Mode.VIEW ? "disabled" : "" }
                                        className="mr-2"
                                        name="petTypes"
                                        value={type}
                                        checked={petTypes.includes(type)}
                                        onChange={() => {
                                            let temp = [...petTypes];
                                            if (petTypes.includes(type))
                                                temp = temp.filter(value => value !== type)
                                            else
                                                temp.push(type)
                                            setPetTypes(temp)
                                        }} />
                                    <div className="flex flex-row items-center space-x-2">
                                        <img src={`/petType/${type}.png`} alt={type} className="h-6 w-6"></img>
                                        <span className="capitalize">{type.replace("_", " ").toLowerCase()}</span>
                                    </div>
                                </li>
                            )}
                        </ul>
                    </div>
                    <div className="flex flex-row justify-center w-full space-x-2">
                        <label>Preferred Sitting Types:
                            <InfoComponent>Choose the type of service you need for your pet:<br />
                                - <b>Overnight Stay</b>: A sitter stays with your pet at your home overnight, ensuring they are cared for throughout the night.<br />
                                - <b>Drop-in Visit</b>: A sitter visits your home for a short period to feed, play with, and check on your pet.<br />
                                - <b>Housesitting</b>: A sitter stays in your home while you are away, providing continuous care for your pet and house.<br />
                                - <b>Daycare</b>: A sitter takes care of your pet during the day, providing companionship and attention while you are at work or busy.
                            </InfoComponent>
                        </label>
                        <ul className='flex flex-col w-full rounded-md border-0 py-4 pl-10 pr-2 text-black ring-1 ring-gray-400 text-sm space-y-4 justify-center' id="sittingType">
                            {[SITTING.DAYCARE, SITTING.DROPIN_VISIT, SITTING.HOUSESITTING, SITTING.OVERNIGHT_STAY].map(type =>
                                <li key={type} className="flex items-center">
                                    <input type="checkbox"
                                        disabled={ formMode === Mode.VIEW ? "disabled" : "" }
                                        className="mr-2"
                                        name={"sittingTypes" + type}
                                        value={type}
                                        checked={sittingTypes.includes(type) ? true : false}
                                        onChange={() => {
                                            let temp = [...sittingTypes];
                                            if (sittingTypes.includes(type))
                                                temp = temp.filter(value => value !== type)
                                            else
                                                temp.push(type)
                                            setSittingTypes(temp)
                                        }} />
                                    <span className="capitalize">{type.replace("_", " ").toLowerCase()}</span>
                                </li>
                            )}
                        </ul>
                    </div>
                    <div className="flex flex-col justify-center w-full">
                        <label>Price per Stay [€]:
                            <InfoComponent>Specify your price per stay for each of your selected sitting types.</InfoComponent>
                        </label>
                        <p className="mt-2" hidden={!sittingTypes.includes(SITTING.DAYCARE)}>Day Care</p>
                        <input type="number" min={0}
                            disabled={ formMode === Mode.VIEW ? "disabled" : "" }
                            hidden={!sittingTypes.includes(SITTING.DAYCARE)}
                            className='w-full mt-2 rounded-md border-0 py-2 pl-4 pr-2 placeholder:text-black text-black ring-1 ring-gray-400 sm:text-sm sm:leading-6'
                            name="priceDayCare"
                            id="priceDayCare"
                            value={priceDayCare}
                            onChange={event => setPriceDayCare(event.target.value)} />
                        <p className="mt-2" hidden={!sittingTypes.includes(SITTING.DROPIN_VISIT)}>Drop-In Visit</p>
                        <input type="number" min={0}
                            disabled={ formMode === Mode.VIEW ? "disabled" : "" }
                            hidden={!sittingTypes.includes(SITTING.DROPIN_VISIT)}
                            className='w-full mt-2 rounded-md border-0 py-2 pl-4 pr-2 placeholder:text-black text-black ring-1 ring-gray-400 sm:text-sm sm:leading-6'
                            name="priceDropInVisits"
                            id="priceDropInVisits"
                            value={priceDropInVisits}
                            onChange={event => setPriceDropInVisits(event.target.value)} />
                        <p className="mt-2" hidden={!sittingTypes.includes(SITTING.HOUSESITTING)}>Housesitting</p>
                        <input type="number" min={0}
                            disabled={ formMode === Mode.VIEW ? "disabled" : "" }
                            hidden={!sittingTypes.includes(SITTING.HOUSESITTING)}
                            className='w-full mt-2 rounded-md border-0 py-2 pl-4 pr-2 placeholder:text-black text-black ring-1 ring-gray-400 sm:text-sm sm:leading-6'
                            name="priceHomesitting"
                            id="priceHomesitting"
                            value={priceHomesitting}
                            onChange={event => setPriceHomesitting(event.target.value)} />
                        <p className="mt-2" hidden={!sittingTypes.includes(SITTING.OVERNIGHT_STAY)}>Overnight Stay</p>
                        <input type="number" min={0}
                            disabled={ formMode === Mode.VIEW ? "disabled" : "" }
                            hidden={!sittingTypes.includes(SITTING.OVERNIGHT_STAY)}
                            className='w-full mt-2 rounded-md border-0 py-2 pl-4 pr-2 placeholder:text-black text-black ring-1 ring-gray-400 sm:text-sm sm:leading-6'
                            name="priceOvernightStay"
                            id="priceOvernightStay"
                            value={priceOvernightStay}
                            onChange={event => setPriceOvernightStay(event.target.value)} />
                    </div>
                    <div className="flex flex-col justify-center w-full">
                        <label>Short Description:
                            <InfoComponent>
                                Provide a brief description about yourself as a pet sitter. This short description will be shown to potential clients in the list of all available offers, so make it engaging and informative.
                            </InfoComponent>
                        </label>
                        <textarea className='w-full mt-2 rounded-md border-0 py-2 pl-4 pr-4 placeholder:text-black text-black ring-1 ring-gray-400 sm:text-sm sm:leading-6'
                            disabled={ formMode === Mode.VIEW ? "disabled" : "" }
                            type="text"
                            id="short_description"
                            name="short_description"
                            maxLength={250}
                            minLength={10}
                            required
                            rows={5}
                            value={shortDescription}
                            onChange={event => setShortDescription(event.target.value)} />
                    </div>
                    <div className="flex flex-col justify-center w-full">
                        <label>Description:
                            <InfoComponent>
                                Provide a detailed description about yourself as a pet sitter. This description will be shown on the offer page once a pet holder has selected it, indicating their interest in your services. Be specific and informative.
                            </InfoComponent>
                        </label>
                        <textarea className='w-full mt-2 rounded-md border-0 py-2 pl-4 pr-4 placeholder:text-black text-black ring-1 ring-gray-400 sm:text-sm sm:leading-6'
                            disabled={ formMode === Mode.VIEW ? "disabled" : "" }
                            type="text"
                            id="description"
                            name="description"
                            maxLength={1000}
                            minLength={10}
                            required
                            rows={10}
                            value={description}
                            onChange={event => setDescription(event.target.value)} />
                    </div>
                    <div className="flex flex-col justify-center w-full">
                        <span>Gallery:
                            <InfoComponent>
                                In the gallery section, you can upload pictures to showcase your pet sitting experience. These images will be displayed on your offer page, giving potential clients a visual sense of your interaction with pets.<br />
                                Click on the <b>'+'</b> icon to upload pictures.
                            </InfoComponent>
                        </span>
                        <label htmlFor="images" className="p-4 mt-2 bg-gray-200 w-max rounded-md hover:bg-gray-300 duration-200"><IoMdAdd size={30} /></label>
                        <input type="file" hidden accept="image/*"
                            disabled={ formMode === Mode.VIEW ? "disabled" : "" }
                            className='w-full rounded-md border-0 py-2 pl-4 pr-4 placeholder:text-black text-black ring-1 ring-gray-400 sm:text-sm sm:leading-6'
                            id="images"
                            name="images"
                            onChange={event => {
                                Array.from(event.target.files).forEach(item => {
                                    const reader = new FileReader()
                                    reader.readAsDataURL(item)
                                    reader.onload = () => {
                                        setGalleryImages([
                                            ...galleryImages,
                                            {
                                                data: reader.result,
                                                type: item.type
                                            }
                                        ])
                                        event.target.value = null; // reset, so upload + delete + upload of same img possible
                                    }
                                })
                            }} />

                        <div className="flex flex-row">
                            {galleryImages.map(image => {
                                const imgsrc = Buffer(image.data).toString()
                                return <img key={imgsrc} src={imgsrc} alt=""
                                    className="p-4 mt-2 h-20 w-auto rounded-md hover:bg-gray-200 duration-200"
                                    onClick={() => {
                                        if(formMode === Mode.VIEW) return;
                                        setGalleryImages(galleryImages.filter(item => item !== image))
                                    }}
                                    />
                            })}
                        </div>
                    </div>

                    <div className="flex flex-col justify-center w-full">{ formMode !== Mode.CREATE ?
                        "You can change your IBAN under the Profile tab."
                        : <>
                            <label>IBAN:</label>
                            <input type="text"
                                className='w-full mt-2 rounded-md border-0 py-2 pl-4 pr-2 placeholder:text-black text-black ring-1 ring-gray-400 sm:text-sm sm:leading-6'
                                name="iban"
                                minLength={3} required
                                id="iban"
                                value={iban}
                                onChange={event => setIban(event.target.value)} />
                        </>
                    }</div>

                    <div className="flex flex-row items-center justify-center">
                        <button type="submit"
                            disabled={formMode === Mode.VIEW ? "disabled" : ""}
                            className='w-max m-2 mt-6 text-gray-300 bg-emerald-900 py-2 px-4 rounded-full hover:bg-emerald-950 duration-200 disabled:bg-gray-600'
                            >
                            <span className="flex items-center">
                                { formMode === Mode.CREATE ?
                                    <><PiPawPrint className="mr-2" size={25} />Insert Offer</>
                                    : <><FaRegSave className="mr-2" size={20} />Save Offer</>
                                }
                            </span>
                        </button>

                        { formMode === Mode.CREATE ?
                            <button className='w-max m-2 mt-6 text-gray-300 bg-red-900 py-2 px-4 rounded-full hover:bg-red-950 duration-200'
                                onClick={() => {
                                    setFormMode(Mode.VIEW);
                                    setPriceDayCare("");
                                    setPriceDropInVisits("");
                                    setPriceHomesitting("");
                                    setPriceOvernightStay("");
                                    setDescription("");
                                    setPetTypes([]);
                                    setSittingTypes([]);
                                    setGalleryImages([]);
                                }}>
                                <span className="flex items-center"><MdOutlineDeleteForever className="mr-2" size={25} />Cancel</span>
                            </button>
                            :
                            <button className={`w-max m-2 mt-6 text-gray-300 ${formMode === Mode.EDIT ? "bg-red-900 hover:bg-red-950" : "bg-emerald-900 hover:bg-emerald-950"} py-2 px-4 rounded-full duration-200`}
                                onClick={event => {
                                    event.preventDefault()
                                    if (formMode === Mode.EDIT) {
                                        setFormMode(Mode.VIEW)
                                        loadOfferFromDB()
                                    } else
                                        setFormMode(Mode.EDIT)
                                }}>
                                <span className="flex items-center"><FaRegEdit className="mr-2" />
                                    {formMode === Mode.EDIT ? "Cancel" : "Edit Offer"}
                                </span>
                            </button>
                        }

                        { formMode === Mode.CREATE ? "" : // delete only if offer != null
                            <button className='w-max m-2 mt-6 text-gray-300 bg-red-900 py-2 px-4 rounded-full hover:bg-red-950 duration-200'
                                onClick={event => handleDeleteOffer(event)}>
                                <span className="flex items-center"><MdOutlineDeleteForever size={20} className="mr-2" />Delete Offer</span>
                            </button>
                        }
                    </div>
                </form>
            </div>
        )
    }


    return <div className="flex flex-col h-full">
        <div className="bg-white rounded-xl m-4 mr-2 flex flex-col">
            <h2 className="text-xl font-bold ml-4 mt-4">
                Your Offer
                <InfoComponent>
                    To create an offer, set your preferred pet and sitting types, prices, and detailed descriptions to attract pet owners. These descriptions will be visible in public listings. You can also upload images from previous sitting jobs to showcase your experience.<br />
                    Once your offer is created, you can view it on this page. By clicking "Edit" you can still make changes to the offer or add more pictures to your gallery. This allows you to keep your profile up-to-date and appealing to potential clients. If you want to remove pictures, simply go into the edit mode and select the images you want to delete.
                </InfoComponent>
            </h2>
            {
                auth.offer || formMode === Mode.CREATE ?
                    OfferForm() // <OfferForm /> enforces re-render
                    :
                    EmptyOffer() // <EmptyOffer /> enforces re-render
            }
        </div>
    </div>
}