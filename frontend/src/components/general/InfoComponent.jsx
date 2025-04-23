import { FaInfo } from "react-icons/fa"

export default function InfoComponent({ children, setLeft = false }) {
    return (
        <div className="inline-block relative group ml-2 text-black text-left">
            <div className="p-2 w-6 h-6 flex justify-center items-center rounded-full duration-300 ring-1 ring-gray-600 cursor-pointer"><FaInfo color="rgb(75 85 99 / var(--tw-ring-opacity))" size={12} /></div>
            <div className={`absolute min-w-80 top-7 p-6 rounded-xl text-sm italic font-medium group-hover:visible invisible transition-opacity bg-gray-50 z-[1001] shadow-md ${setLeft && "right-0"} `}>
                {children}
            </div>
        </div>
    );
};
