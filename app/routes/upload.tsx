import React, {type FormEvent, useState} from 'react'
import Navbar from "~/components/Navbar";

const Upload = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    }


    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />
            <section className="main-section">
                <div className="page-header">
                    <h1>Smart feedback for your dream jobs</h1>
                    {isProcessing ? (
                       <>
                           <h2>{statusText}</h2>
                           <img src='/images/resume-scan.gif' className="w-full" alt="Resume" />
                       </>
                    ) :
                        <h2>Drop your resume for an ATS score and improvement tips</h2>
                    }
                    {!isProcessing && (
                        <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
                             <div className="form-div">
                                 <label htmlFor="company-name">Company Name</label>
                                 <input type="text" placeholder="Company Name" name="company-name" id="company-name" />
                             </div>
                            <div className="form-div">
                                <label htmlFor="job-title">Job Title</label>
                                <input type="text" placeholder="Job Title" name="job-title" id="job-title" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-description">Job Description</label>
                                <textarea rows={5} placeholder="Job Description" name="job-description" id="job-description" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="uploader">Upload Resume</label>
                                <div>Uploader</div>
                            </div>
                            <button type="submit" className="primary-button">Analyze Resume</button>
                        </form>
                    )}
                </div>

            </section>
        </main>
    )
}
export default Upload
