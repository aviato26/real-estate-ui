
import react from "react";
import './header.css';

const Header = () => {
    return(
        <div>
            <header className='header'>
                <h2>Super Cool Estates</h2>       
                <div className='header-links'>
                    <ul>
                        <li>Page 1</li>
                        <li>Page 2</li>
                        <li>Page 3</li>                                                
                    </ul>
                </div>         
            </header>
        </div>
    )
}

export default Header;