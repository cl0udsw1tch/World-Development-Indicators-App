import { useContext, useEffect, useRef, useState } from 'react'
import * as d3 from "d3";
import { SetStateType } from '../../types';
import { GraphContextReader, GraphContextWriter } from '../../contexts/GraphContext';
import * as api from "../../api"
import { InputContextWriter } from '../../contexts/InputContext';


type ChartData = {
    svg             : d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
    margins         : {left: number, right: number, top: number, bottom: number},
    contentDims     : {width: number, height: number},
    content         : d3.Selection<SVGGElement, unknown, HTMLElement, any>,
    xScale          : d3.ScaleLinear<number, number, never>,
    yScale          : d3.ScaleLinear<number, number, never>,
    xAxis           : d3.Axis<d3.NumberValue>,
    yAxis           : d3.Axis<d3.NumberValue>,
    xAxisGroup      : d3.Selection<SVGGElement, unknown, HTMLElement, any>,
    yAxisGroup      : d3.Selection<SVGGElement, unknown, HTMLElement, any>,
}

const Graph = ({indicator} : {indicator: string}) => {

    const graphContextWriter = useContext(GraphContextWriter)
    const [graphData, setGraphData] : [api.API_data_t, SetStateType<api.API_data_t>] = useState({})
    const [errorMsg, setErrorMsg] = useState("")

    const [chartData, setChartData] = useState<ChartData | null>(null)
    const [chartDims, setChartDims] = useState({width: 0, height: 0})
    const svgRef = useRef<SVGSVGElement | null>(null)

    const graphContextReader = useContext(GraphContextReader)
    const inputContextSetter = useContext(InputContextWriter)

    const [removeChartActive, setRemoveChartActive] = useState(false)


    const handleResize = (entries: ResizeObserverEntry[]) => {

        const d = entries[0].contentRect
        setChartDims(() => ({
            width: d.width, 
            height: d.height
        }))
    }


    
    const initChart = ({width, height}: {width: number, height: number}) => {
        
        const svg = d3.select(`.graph>.chart#indicator${indicator.replace(/\./g, "_")}`).select("svg")
        
        const margins = {left: 100, right: 50, top: 50, bottom: 50}
        
        const contentWidth = width - margins.left - margins.right;
        const contentHeight = height - margins.top - margins.bottom;
        
        const content = svg.append("g")
        .attr("class", "content")
        .attr("transform", `translate(${margins.left}, ${margins.top})`)
        

        const xScale = d3.scaleLinear()
        .domain([graphContextReader[indicator].yearStart, graphContextReader[indicator].yearEnd])
        .range([0, contentWidth])
        
        const xAxis = d3.axisBottom(xScale)
        .ticks(Math.floor(contentWidth / 200))
        .tickSize(1)

        const xAxisGroup = content.append("g")
        .attr("class", "xAxis")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis)
        //alert(`translate(0, ${height})`)

        const yScale = d3.scaleLinear()
            .domain([])
            .range([contentHeight, 0])
            
        const yAxis = d3.axisLeft(yScale).tickSize(1)

        const yAxisGroup = content.append("g")
        .attr("class", "yAxis")
        .call(yAxis)
        

        setChartData(() => ({
            svg             : svg,
            margins         : margins,
            contentDims     : {width: 0, height: 0},
            content         : content,
            xScale          : xScale,
            yScale          : yScale,
            xAxis           : xAxis,
            yAxis           : yAxis,
            xAxisGroup      : xAxisGroup,
            yAxisGroup      : yAxisGroup
        }))
        
    }

    const scaleChart = () => {
        setChartData((old: ChartData | null) : ChartData => {
            const _old = old as ChartData
            const contentDims = {
                width: chartDims.width - _old.margins.left - _old.margins.right,
                height: chartDims.height - _old.margins.top - _old.margins.bottom
            }

            const xScale = _old.xScale
            .domain([graphContextReader[indicator].yearStart, graphContextReader[indicator].yearEnd])
            .range([0, contentDims.width])
            
            const y_min = d3.min(Object.keys(graphData), (d) => (d3.min(graphData[d], (e) => e.value)))!
            const y_max = d3.max(Object.keys(graphData), (d) => (d3.max(graphData[d], (e) => e.value)))!
            const yScale = _old.yScale
            .domain([y_min, y_max])
            .range([contentDims.height, 0])
            

            const xAxis = d3.axisBottom(xScale).ticks(Math.floor(chartDims.width / 100))
            const yAxis = d3.axisLeft(yScale).ticks(Math.floor(chartDims.height / 100))
     
            const xAxisGroup = _old.xAxisGroup
            .attr("transform", `translate(0, ${contentDims.height})`)
            .call(xAxis)
            const yAxisGroup = _old.yAxisGroup
            .attr("transform", `translate(0, 0)`)
            .call(yAxis)

            return ({
                ..._old,
                contentDims: contentDims,
                xScale: xScale,
                yScale: yScale,
                xAxis: xAxis,
                yAxis: yAxis,
                xAxisGroup: xAxisGroup,
                yAxisGroup: yAxisGroup
            })
        })
    }

    const renderGraph = () => {

        const lineContainer = chartData!.content
        .selectAll(`g.line`)
        .data(graphContextReader[indicator].countries.filter(country => graphData[country].length > 0).map((country) => graphData[country]), 
        (_, i) => graphContextReader[indicator].countries[i])
        .join("g")
        .attr("class", (_, i) => "line " + graphContextReader[indicator].countries[i])
        .attr("country", (_, i) => graphContextReader[indicator].countries[i])

        
        
        const pointContainer = lineContainer.selectAll("g.point")
        .data((d, _) => d)
        .join("g").attr("class", "point")
        
        const circleContainer = pointContainer.selectAll("circle")
        .data(d => [d])
        .join("circle")
        
        
        circleContainer.style("cursor", "pointer")
        .attr("cx", (d, _) => chartData!.xScale(d.year))
        .attr("cy", (d, _) => chartData!.yScale(d.value))
        .attr("r", 1)
        .attr("stroke", "magenta")
        .attr("stroke-width", 2)
        
        pointContainer.on("mouseover", function(_, d){
            d3.select(this).append("text")
            .text(`(${d.year},${d.value})`)
            .style("text-anchor", "middle")
            .style("cursor", "pointer")
            .attr("stroke","none")
            .attr("fill", "rgb(2, 136, 154)")
            .attr("x", chartData!.xScale(d.year))
            .attr("y", chartData!.yScale(d.value))
        })

        pointContainer.on("mouseleave", function(_, __){
            d3.select(this).selectAll("text").remove()
        })

        const lineGenerator = d3.line<{year: number, value: number}>()
        .x((d: {year: number, value: number}) => chartData!.xScale(d.year))
        .y((d: {year: number, value: number}) => chartData!.yScale(d.value))

        lineContainer.selectAll("path")
        .data(d => [d])
        .join("path")
        .attr("d", lineGenerator)
        .attr("fill", "none")
        .attr("stroke", "#4444FF50")
        .attr("stroke-width", 2)

        lineContainer.selectAll("text")
        .data((d) => [d[d3.maxIndex(d, e => e.year)]])
        .join("text")
        .text((function(){
            const selection = d3.select((this as SVGTextElement).parentElement!)
            return selection.attr("country")
        }))
        .attr("x", d => chartData!.xScale(d.year) + 10)
        .attr("y", d => chartData!.yScale(d.value))
        .attr("stroke", "none").attr("fill", "orange")

        

    }

    useEffect(() => {
        const resizeObserver = new ResizeObserver(handleResize);
        if (svgRef.current) {
            resizeObserver.observe(svgRef.current)
            const rect = svgRef.current!.getBoundingClientRect()
            setChartDims(() => ({width: rect.width, height: rect.height}))
            initChart({width: rect.width, height: rect.height})
        }

        return () => {
            d3.select(`.graph>.chart#indicator${indicator.replace(/\./g, "_")}`)
            .select("svg")
            .selectAll("g").remove()
            if (svgRef.current) {
                resizeObserver.unobserve(svgRef.current);
            }
        }
    }, [])

    useEffect(() => {
        setGraphData(() => ({}))
        if (graphContextReader[indicator].countries.length > 0) {
            api.get_data(graphContextReader[indicator].countries, indicator, graphContextReader[indicator].yearStart, graphContextReader[indicator].yearEnd)
            .then((res: api.API_data_t) => {setGraphData(() => res); setErrorMsg(() => "")})
            .catch((e: Error) => {
                setErrorMsg(() => 
                    e.message
            )
        })
    }
    }, [graphContextReader[indicator]])


    useEffect(() => {

        scaleChart()

    }, [chartDims])

    useEffect(() => {
        if (Object.keys(graphData).length > 0) {
            scaleChart()   
        } 
    }, [graphData])

    useEffect(() => {
        if (Object.keys(graphData).length > 0) {
            console.log(JSON.stringify(graphData))
            renderGraph()   
        } 
    }, [chartData, graphData])

    return (
        <div className='graph'>
            <span onClick={() => {inputContextSetter((input) => ({
                    indicator: {code: indicator, name: graphContextReader[indicator].name},
                    countries: [...new Set([...input.countries.slice(0, 10 - graphContextReader[indicator].countries.length), ...graphContextReader[indicator].countries])],
                    yearStart: graphContextReader[indicator].yearStart,
                    yearEnd: graphContextReader[indicator].yearEnd
                }))}}>
                {indicator}<br></br>
                {graphContextReader[indicator].name}
            </span>
            <div className='chart' id={`indicator${indicator.replace(/\./g, "_")}`}>
                {errorMsg == "" ? 
                <svg ref={svgRef} width={"100%"} height={"100%"}>

                </svg> : <span>{errorMsg}</span>}
            </div> 
            <div className={`removeGraph ${removeChartActive? "active" : ""}`} onMouseEnter={() => {setRemoveChartActive(() => true)}} onMouseLeave={() => {setRemoveChartActive(() => false)}}>
                <i className="fi fi-sr-cross-circle"  onClick={() => {
                graphContextWriter((graphData) => {
                    const d = graphData
                    delete d[indicator]
                    return {...d}
                })
            }}></i>
            </div>
        </div>
    )
}

export default Graph