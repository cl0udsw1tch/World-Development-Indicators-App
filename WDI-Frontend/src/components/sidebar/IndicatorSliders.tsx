
import { IndicatorContextWriter, IndicatorLetters } from '../../contexts/InputContext';
import { IsSearchingContextWriter, IndicatorDisplayContextWriter } from '../../contexts/InputContext';
import {  useContext, useEffect, useRef, useState } from 'react';

const LetterWheel = ({ idx }: { idx: keyof IndicatorLetters }) => {
    const indicatorsContextWriter = useContext(IndicatorContextWriter);
    const indicatorDisplayContextWriter = useContext(IndicatorDisplayContextWriter)
    const [letter, setLetter] = useState<string>("");
    const ref = useRef<HTMLDivElement>(null);
    const setIsSearching = useContext(IsSearchingContextWriter)

    const handleWheel = (event: { preventDefault: () => void; stopPropagation: () => void; deltaY: number; }) => {
        event.preventDefault();
        event.stopPropagation();
        indicatorDisplayContextWriter(() => "code")
        setIsSearching(() => false)
        

        setLetter((prevLetter) => {
            if (prevLetter === "A" && event.deltaY < 0) {
                return "";
            } else if (prevLetter === "" && event.deltaY > 0) {
                return "A";
            } else if (event.deltaY > 0 && prevLetter < "Z") {
                return String.fromCharCode(prevLetter.charCodeAt(0) + 1);
            } else if (event.deltaY < 0 && prevLetter > "A") {
                return String.fromCharCode(prevLetter.charCodeAt(0) - 1);
            } else {
                return prevLetter;
            }
        });
    };

    useEffect(() => {
        if (ref.current) {
            ref.current.addEventListener("wheel", handleWheel, { passive: false });
        }
        return () => {
            if (ref.current) {
                ref.current.removeEventListener("wheel", handleWheel);
            }
        };
    }, []);

    useEffect(() => {
        indicatorsContextWriter(letters => ({ ...letters, [idx]: letter }));
    }, [letter]);

    return (
        <div className="letterWheel" ref={ref}>
            <span>{letter? letter : "_"}</span>
        </div>
    );
};

const IndicatorSliders = () => {
    return (
        <div id="indicatorWheels">
            <LetterWheel idx="first" />
            <LetterWheel idx="second" />
            <LetterWheel idx="third" />
        </div>
    );
};

export default IndicatorSliders;