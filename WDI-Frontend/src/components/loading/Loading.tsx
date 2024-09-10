import { useAnimate } from "framer-motion"
import { motion } from "framer-motion"
import { useEffect } from "react"

const Loading = () => {
    const [bottom_scope, bottom_animate] = useAnimate()
    const [top_scope, top_animate] = useAnimate()

    useEffect(() => {
        if (top_scope.current && bottom_scope.current) {
            const topBounceAnimation = {
                stroke: ["#09CBC5", "#FF00FF"],
                y: [10, 50],  // Simultaneously move up and down
            };

            const bottomBounceAnimation = {
                stroke: ["#FF00FF","#09CBC5"],
                y: [10, -50],  // Simultaneously move up and down
            };


            top_animate(top_scope.current, topBounceAnimation, {
                duration: 0.5,
                repeat: Infinity, 
                repeatType: "reverse",
                ease: [0.3, 0.7, 0.5, 1]
            
     
            });
            bottom_animate(bottom_scope.current, bottomBounceAnimation, {
                duration: 0.5,
                repeat: Infinity,
                repeatType: "reverse",
                ease: [0.3, 0.7, 0.5, 1]
            
            });
        }
    }, [])
  return (
    <div id="Loading">
        <motion.svg width={"100%"} height={"100%"} viewBox={`-100 -100 200 200`}>
            <motion.circle className="bottom" ref={bottom_scope} r={"10"}  cx="0" cy="-10"  stroke={"#FF00FF"} fill={"transparent"} strokeWidth={"2"}/>
            <motion.circle className="top" ref={top_scope}  r={"10"}  cx="0" cy="10" stroke={"#FF00FF"} fill={"transparent"} strokeWidth={"2"}/>
        </motion.svg>

    </div>
  )
}

export default Loading