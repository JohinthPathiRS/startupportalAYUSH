import { UploadCloud } from "lucide-react";
import { useEffect, useRef } from "react";
import PropTypes from 'prop-types'; // Import PropTypes
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const UploadWidget = ({ setUploadedFiles }) => {
    const cloudinaryRef = useRef();
    const widgetRef = useRef();

    useEffect(() => {
        cloudinaryRef.current = window.cloudinary;
        widgetRef.current = cloudinaryRef.current.createUploadWidget({
            cloudName: 'doxjg7rvs',
            uploadPreset: 'ayushUpload'
        }, (error, result) => {
            if (!error && result && result.event === "success") {
                console.log(result.info);
                setUploadedFiles((prev) => [...prev, {
                    name: result.info.display_name + "." + result.info.format, // Fixed format concatenation
                    status: "success",
                    url: result.info.url
                }]);
            }
        });
    }, [setUploadedFiles]); // Ensure dependency array includes setUploadedFiles

    return (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">Drag and drop your files here, or click to select files</p>
            <Input id="file-upload" type="file" className="hidden" multiple />
            <Button className="mt-4" onClick={() => widgetRef.current.open()}>
                Select Files
            </Button>
        </div>
    );
};

// ✅ Add PropTypes validation
UploadWidget.propTypes = {
    setUploadedFiles: PropTypes.func.isRequired, // Ensures it's a function and required
};

export default UploadWidget;
