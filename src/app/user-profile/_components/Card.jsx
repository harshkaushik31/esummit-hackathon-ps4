export default function Card({imageUrl,id,description}) {
    return (
        <div className="p-4 bg-gray-950/80 backdrop-blur-md border border-cyan-500/30 rounded-lg shadow max-w-80 m-2">
            <img className="rounded-md max-h-40 w-full object-cover" src={imageUrl} alt="officeImage" />
            <p className="text-cyan-100 text-xl font-semibold ml-2 mt-2">{id}</p>
            <p className="text-cyan-500 text-sm my-3 ml-2">{description}</p>
        </div>
    );
};