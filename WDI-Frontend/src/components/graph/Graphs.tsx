import{ useContext } from 'react'
import { GraphContextReader } from '../../contexts/GraphContext'
import Graph from './Graph'


const Graphs = () => {
    const graphContext = useContext(GraphContextReader)

  return (

        <div className='graphs'>
            {Object.keys(graphContext).map((indicator) => 
                <Graph 
                indicator = {indicator}
                key = {indicator}
                
                />
                
            )}
            
        </div>

  )
}

export default Graphs