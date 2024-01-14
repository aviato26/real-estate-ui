


import React from "react";
import './contact.css';


const ContactPage = () => {
    return (
        <div id="contact-container">
            <div id='contact-title'>
                <span>C</span>
                <p>ontac</p>
                <span>T</span>
                <button>Email</button>                
            </div>

            <div id="contact-info">
                <div>
                    <p>867 someplace street, MA, 53109</p>
                    <p>123 another place street, NY, 29292</p>                    
                    <p>7712 last place street, CA, 33122</p>                                        
                </div>

                <div>
                    <p>Phone: 323-552-9910</p>
                    <p>say hi at: southbay@yo.com</p>                    
                    <p>Email: southbay@test.com</p>
                </div>

                <div>
                    <p>Facebook</p>
                    <p>Twitter</p>
                    <p>Instagram</p>
                </div>

            </div>            

        </div>
    );
}

export default ContactPage;
