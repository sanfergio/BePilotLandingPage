import React from "react";
import Header from "../../components/Header/Header";
import Hero from "../../components/Hero/Hero";
import Features from "../../components/Features/Features";
import Pricing from "../../components/Pricing/Pricing";
import Footer from "../../components/Footer/Footer";

function Home() {
    return (
        <div>
            <Header />
            <main>
                <Hero />
                <Features />
                <Pricing />
            </main>
            <Footer />
        </div>
    );
}

export default Home;