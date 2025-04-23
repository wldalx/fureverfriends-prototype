import { useEffect, useState } from 'react'
import ImageGallery from "react-image-gallery"
import { Buffer } from 'buffer/' // trailing slash required

import ICONS from '../../utils/IconRoutes.js'
import { convertDate } from '../../utils/Date.js'

import "./gallery.css"


export default function GalleryRatingSection({ reviews, gallery }) {
    // all images shown in the gallery are parsed and then stored in images
    const [images, setImages] = useState([])
    useEffect(() => {
        let imgArray = []
        gallery?.forEach(img => {
            let buffer = Buffer(img.data).toString();
            imgArray.push({ original: buffer, thumbnail: buffer })
        })
        setImages(imgArray)
    }, [gallery])

    return (
        <div className="flex my-16 min-h-96">
            <div className="flex-1">
                <div className="flex items-center">
                    <img className="max-h-6 mx-1" src={ICONS.GALLERY} alt="Gallery Symbol" />
                    <h1 className="ml-1 text-xl font-bold py-4">Gallery</h1>
                </div>
                {(gallery && gallery.length > 0) ?
                    <ImageGallery additionalClass="my-4 mx-10" items={images} autoPlay={true} showFullscreenButton={false} showPlayButton={false} />
                    :
                    <div className="h-full flex items-center justify-center">
                        <p className="text-xl font-semibold">There are no pictures yet!</p>
                    </div>
                }
            </div>
            <div className="flex-1">
                <div className="flex items-center">
                    <img className="max-h-6 mx-1" src={ICONS.STAR} alt="Star Symbol" />
                    <h1 className="ml-1 text-xl font-bold py-4">Reviews</h1>
                </div>
                <div className="h-[calc(100%-3.75rem)] p-2 overflow-y-scroll">
                    {(reviews && reviews.length > 0) ?
                        reviews.map(review =>
                            <div key={review._id} className="my-4 p-6 rounded-2xl shadow-xl hover:bg-gray-100">
                                <p className="font-semibold capitalize">
                                    {`${review.booking.bookingUser.firstName} ${review.booking.bookingUser.lastName}
                                 | ${review.booking.sittingType.replace("_", " ").toLowerCase()}
                                 | ${convertDate(review.date)}`}
                                </p>
                                <div className="flex flex-row mt-1 mb-3">
                                    { [...Array(review.rating /*int*/)].map((_, index) =>
                                        <img key={index} className="w-4 mr-1" src={ICONS.STAR} alt="Star Symbol" />
                                    ) }
                                </div>
                                <p>"{review.description}"</p>
                            </div>)
                        :
                        <div className="h-full flex items-center justify-center">
                            <p className="text-xl font-semibold">There are no reviews yet!</p>
                        </div>
                    }
                </div>
            </div>
        </div>
    );
};
