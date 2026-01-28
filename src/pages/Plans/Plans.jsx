import React from "react";
import Header from "../../components/Header/Header";
// import Hero from "../../components/Hero/Hero"; // Descomente se for usar
// import Features from "../../components/Features/Features"; // Descomente se for usar
import Pricing from "../../components/Pricing/Pricing";
import Footer from "../../components/Footer/Footer";

function Plans() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <main style={{ flex: 1 }}>
                <Pricing />
            </main>
            <Footer />
        </div>
    );
}

export default Plans;