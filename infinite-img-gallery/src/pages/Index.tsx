import InfiniteGrid from '../components/InfiniteGrid';

const Index = () => {
    const scalePos = 1.3; // more space between images (1.3 = 30% more spread)

    const sources = [
        { src: 'img1.jpg', caption: 'strawberry island slush' },
        { src: 'img2.jpg', caption: 'Jamaica' },
        { src: 'img3.jpg', caption: 'while in New York' },
        { src: 'img4.jfif', caption: 'random summer in New York' },
        { src: 'img5.jpg', caption: 'Brooklyn' },
        { src: 'img6.jpg', caption: 'I made chicken and waffles' },
        { src: 'img7.jpg', caption: 'I made waffles with fruits' },
        { src: 'img8.jpg', caption: 'Riu Aquarelle' },
        { src: 'img9.jpg', caption: 'Philly African American Museum' },
        { src: 'img10.JPG', caption: 'honey bbq wings with Tacos' },
        { src: 'img11.JPG', caption: 'Yale Quantum School' },
        { src: 'img12.JPG', caption: 'Yale Quantum School' },
        { src: 'img13.JPG', caption: 'Yum Yum Wings with Sliders' },
        { src: 'img14.JPG', caption: 'Museum @ NYC' },
        { src: 'img15.JPG', caption: 'Museum @ NYC' },
        { src: 'img16.JPG', caption: 'Museum @ NYC' },
        { src: 'img17.JPG', caption: 'Montego Bay Jamaica' },
        { src: 'img18.JPG', caption: 'Riu Palace Jamaica' },
        { src: 'img19.JPG', caption: 'Jamaican Fruits' },
    ];

    const data = [
        { x: 71 * scalePos, y: 58 * scalePos, w: 400, h: 270 },
        { x: 211 * scalePos, y: 255 * scalePos, w: 540, h: 360 },
        { x: 631 * scalePos, y: 158 * scalePos, w: 400, h: 270 },
        { x: 1191 * scalePos, y: 245 * scalePos, w: 260, h: 195 },
        { x: 351 * scalePos, y: 687 * scalePos, w: 260, h: 290 },
        { x: 751 * scalePos, y: 824 * scalePos, w: 205, h: 154 },
        { x: 911 * scalePos, y: 540 * scalePos, w: 260, h: 350 },
        { x: 1051 * scalePos, y: 803 * scalePos, w: 400, h: 300 },
        { x: 71 * scalePos, y: 922 * scalePos, w: 350, h: 260 },
        { x: 461 * scalePos, y: 58 * scalePos, w: 280, h: 210 },
        { x: 1411 * scalePos, y: 158 * scalePos, w: 320, h: 240 },
        { x: 191 * scalePos, y: 415 * scalePos, w: 380, h: 285 },
        { x: 881 * scalePos, y: 715 * scalePos, w: 250, h: 200 },
        { x: 131 * scalePos, y: 1188 * scalePos, w: 420, h: 315 },
        { x: 721 * scalePos, y: 415 * scalePos, w: 340, h: 255 },
        { x: 1151 * scalePos, y: 580 * scalePos, w: 290, h: 218 },
        { x: 301 * scalePos, y: 1098 * scalePos, w: 360, h: 270 },
        { x: 831 * scalePos, y: 1015 * scalePos, w: 280, h: 210 },
        { x: 1471 * scalePos, y: 458 * scalePos, w: 240, h: 180 },
    ];

    return (
        <section id="hero" className="w-full h-screen box-border overflow-hidden select-none cursor-grab touch-none">
            <InfiniteGrid
                sources={sources}
                data={data}
                originalSize={{ w: 1522 * scalePos, h: 1238 * scalePos }}
            />
        </section>
    );
};

export default Index;
