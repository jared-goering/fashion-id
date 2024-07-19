import React, { useState } from 'react';
import axios from 'axios';
import './FashionIdentifier.css'; // Import the CSS file

const FashionIdentifier = () => {
    const [image, setImage] = useState(null); // State to store the uploaded image
    const [results, setResults] = useState([]); // State to store the results from the backend

    // Handle image upload and set the image URL for preview
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImage(URL.createObjectURL(file));
        }
    };

    // Handle form submission and send the image to the backend for processing
    const handleIdentify = async (event) => {
        event.preventDefault(); // Prevent the default form submission behavior

        // Create FormData object and append the uploaded file
        const formData = new FormData();
        const fileInput = document.querySelector('input[type="file"]');
        formData.append('image', fileInput.files[0]);

        try {
            // Make a POST request to the backend with the image
            const response = await axios.post('http://localhost:3000/process-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            // Set the results state with the response data
            setResults(response.data);
        } catch (error) {
            // Log any errors that occur during the request
            console.error("There was an error identifying the image!", error);
        }
    };

    return (
        <div className="fashion-identifier">
            <h1>Fashion Identifier</h1>
            <form onSubmit={handleIdentify}>
                <input type="file" onChange={handleImageUpload} />
                {image && <img src={image} alt="Uploaded" className="uploaded-image" />}
                <button type="submit" className="identify-button">Identify Fashion Items</button>
            </form>
            <div className="results">
                {results && results.map((result, index) => (
                    <div key={index} className="result-card">
                        <h2>Result {index + 1}</h2>
                        <a href={result.link} target="_blank" rel="noopener noreferrer">
                            <div className="result-content">
                                <p>{result.text}</p>
                            </div>
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FashionIdentifier;
