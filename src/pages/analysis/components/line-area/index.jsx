import React, { useRef, useEffect, useState, useContext } from "react"

import * as d3 from "d3"
import style from "./index.less"
import myContext from "../../../../assets/js/createContext"
import axios from "@/services"

export default function Radar() {
	const selectAll = useContext(myContext) // 得到父组件传的值
	const currentProvince = selectAll.curProvince
	const currentType = selectAll.curType

	const container = useRef(null)

	const tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip-month")
        .style("position", "absolute")
        .style("z-index", "1200")
        .style("background", "grey")
        .style("padding", "10px")
        .style("border-radius", "5px")
        .style("display", "none");


	useEffect(() => {
		const title =
			currentType === "迁入"
				? "省份-迁入规模指数.json"
				: "省份-迁出规模指数.json"
		axios(title).then((res) => {
			const curData = res.find(
				(item) => item.migratename === currentProvince
			)
			let keyArr = []
			let valueArr = []
			for (let key in curData) {
				if (key !== "migratename" && key !== "citycode") {
					keyArr.push(key)
					valueArr.push(curData[key])
				}
			}

			console.log("valueArr", valueArr);
			console.log("d3.max(valueArr)",d3.max(valueArr))
			console.log("keyArr", keyArr);
		const numericValueArr = valueArr.map(value => parseFloat(value));

			// 现在使用转换后的数组来计算最大值
		const maxValue = d3.max(numericValueArr);

		d3.select(container.current).selectAll("svg").remove();
		const margin = { top: 20, right: 20, bottom: 30, left: 50 };
		const width = 700 - margin.left - margin.right;
        const height = 350 - margin.top - margin.bottom;

		// const svg = d3.select(container.current)
		// 	.append("svg")
		// 	.attr("width", 700) // 调整 SVG 容器大小
		// 	.attr("height", 350);
		const svg = d3.select(container.current)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


		const xScale = d3.scaleBand()
			.range([0, width]) // 宽度应与 SVG 容器宽度相匹配
			.domain(keyArr)
			.padding(0.1);
		
		const yScale = d3.scaleLinear()
			.range([height, 0]) // 高度应与 SVG 容器高度相匹配
			.domain([0, maxValue]);
			// .domain([d3.min(valueArr), d3.max(valueArr)]);// 从最小值到最大值
		

		const line = d3.line()
			.x(d => xScale(d.key))
			.y(d => yScale(d.value));
		
		const area = d3.area()
			.x(d => xScale(d.key))
			.y0(300)
			.y1(d => yScale(d.value));
		const xAxis = d3.axisBottom(xScale)
    		.tickValues(keyArr.filter((_, i) => i % 6 === 0)); // 每隔 5 个显示一个标签

			
				
		svg.append("path")
			.datum(valueArr.map((v, i) => ({ key: keyArr[i], value: v })))
			.attr("fill", "none")
			.attr("stroke", "white")
			.attr("stroke-width", "4") // 设置线的宽度为 3px
			.attr("d", line);
		
		svg.append("path")
			.datum(valueArr.map((v, i) => ({ key: keyArr[i], value: v })))
			.attr("fill", "pink")
			.attr("d", area);

		svg.append("g")
			// .attr("transform", "translate(0,300)")
			.attr("transform", "translate(0," + height + ")")
			.call(d3.axisBottom(xScale))
			.call(xAxis);
		
		svg.append("g")
			.call(d3.axisLeft(yScale));

		const dataPoints = numericValueArr.map((value, i) => ({
			key: keyArr[i],
			value: value
		}));
		
		// 绘制圆点
		svg.selectAll("circle")
			.data(dataPoints)
			.enter()
			.append("circle")
			.attr("cx", d => xScale(d.key))
			.attr("cy", d => yScale(d.value))
			.attr("r", 3) // 圆的半径
			.attr("fill", "white") // 圆的颜色
			.on("mouseover", function(d) {
				tooltip.transition().duration(200).style("opacity", 1);
				const x = d3.event.pageX;
				const y = d3.event.pageY;
				console.log("d",d)
				console.log("x",x)
				console.log("y",y)
				var originalDate = d.key;

				// 将字符串转换为日期格式
				var year = originalDate.substring(0, 4);
				var month = originalDate.substring(4, 6);
				var day = originalDate.substring(6, 8);

				// 构建新的格式化日期字符串
				var formattedDate = `${year}年${month}月${day}日`;
				tooltip.html(`日期: ${formattedDate}<br>迁徙规模指数: ${d.value}`)
				// .style("left", (xScale(d.key) + xScale.bandwidth() / 2) + "px")
				// .style("top", (yScale(d.value) - 28) + "px");
					.style("left", (x+5) + "px")
					.style("top", (y-28) + "px")
					.style("z-index", "1200")
					.style("display", "block")
					.style("color", "white")
					.style("text-align", "left")
					.style("font-size", "15px");
			})
			.on("mouseout", function() {
				tooltip.transition().duration(500).style("opacity", 0);
			})
			return () => {}
		})
	}, [selectAll])

	return <div className="chart-container" ref={container} ></div>
}
