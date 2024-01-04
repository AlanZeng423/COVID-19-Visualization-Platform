import React, { useRef, useEffect, useState, useContext } from "react"
import * as d3 from "d3"
import { sankey, sankeyLinkHorizontal} from "d3-sankey"
import style from "./index.less"
import myContext from "../../../../assets/js/createContext"
import axios from "@/services"

export default function Radar() {
	const selectAll = useContext(myContext) // 得到父组件传的值
	const currentProvince = selectAll.curProvince
	const currentType = selectAll.curType
	const curentData = selectAll.curDate
	

	const container = useRef(null)
	// const tooltip = d3.select(container.current).append("div")
	// 		.attr("class", "tooltip")
	// 		.style("opacity", 0)
	// 		.style("position", "absolute")
	// 		.style("background-color", "grey")
	// 		.style("padding", "5px")
	// 		.style("border-radius", "5px")
	// 		.style("border", "1px solid gray");
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
	// const chart = useRef(null)
	useEffect(() => {
		const title =
			currentType === "迁入"
				? `${currentProvince}-迁入来源地.json`
				: `${currentProvince}-迁出目的地.json`
		axios(title).then(
			(res) => {
				let currentData = Array.from(
					new Set(
						res.map((item) => {
							let obj = {}
							obj.source = currentProvince
							obj.target = item.migratename
							obj.value = Number(item[curentData])
							return obj
						})
					)
				)
				currentData = currentData.filter(
					(item) => !!item.value && item.target !== currentProvince
				)
				let DateName = Array.from(
					new Set(
						currentData.map((item) => {
							let obj = {}
							obj.name = item.target
							return obj
						})
					)
				);
				DateName.push({ name: currentProvince })

				d3.select(container.current).selectAll("svg").remove();
				

				// 设置桑基图的尺寸和边距
				const margin = { top: 10, right: 10, bottom: 10, left: 10 };
				// console.log("CC",container.current.clientWidth)
				const width = container.current.clientWidth - margin.left - margin.right; //690
				const height = container.current.clientHeight - margin.top - margin.bottom;
			
				// 创建SVG元素
				const svg = d3.select(container.current)
							.append("svg")
							.attr("width", width + margin.left + margin.right)
							.attr("height", height + margin.top + margin.bottom)
							.append("g")
							.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
			
				// 设置桑基图布局
				const sankeyGenerator = sankey()
					.nodeWidth(15)
					.nodePadding(10)
					.extent([[1, 1], [width - 60, height - 5]]);

				
				let node = Array.from(new Set(currentData.map(d => d.target).concat(currentProvince)))
				.map(name => ({ name }));

				// const names = DateName.map(item => item.data.name);
				let link = currentData.map(d => ({
					source: DateName.findIndex(node => node.name === d.source), // 将名称转换为索引
					target: DateName.findIndex(node => node.name === d.target), // 将名称转换为索引
					value: d.value
				}));

			
				// 准备桑基图数据
				const sankeyData = {
					nodes: node,
					links: link
				};

				console.log("Nodes:", sankeyData.nodes);
				console.log("Links:", sankeyData.links);
			
				const {nodes, links} = sankeyGenerator(sankeyData);
				const colors = ["#ff8c00", "#98fb98", "#8a2be2", "#00ced1", "#ff69b4", "#ff4500", "#2e8b57"];
			
				// 绘制节点
				svg.append("g")
				.selectAll("rect")
				.data(nodes)
				.enter()
				.append("rect")
				.attr("x", d => d.x0)
				.attr("y", d => d.y0)
				.attr("height", d => d.y1 - d.y0)
				.attr("width", sankeyGenerator.nodeWidth())
				// .attr("fill", "white"); // 可以根据需要修改颜色
				// .attr("fill", d => d.sourceLinks.length === 0 ? "white" : "#90EE90");
				.attr("fill", d => {
					// 如果是右侧节点（没有源链接）
					if (d.sourceLinks.length === 0) {
					  	// 基于索引分配颜色
						return colors[d.index % colors.length];
					}
					// 左侧节点使用默认颜色
					return "white";
				});
			
				// 绘制链接
				svg.append("g")
				.attr("fill", "none")
				.selectAll("g")
				.data(links)
				.enter()
				.append("path")
				.attr("d", sankeyLinkHorizontal())
				.attr("stroke", "rgba(128, 128, 128, 0.5)") // 可以根据需要修改颜色
				.attr("stroke-width", d => Math.max(1, d.width))
				.on("mouseover", function(d, event) {
					tooltip.transition().duration(200).style("opacity", 1);
					const x = d3.event.pageX;
					const y = d3.event.pageY;
					console.log("d",d)
					console.log("x",x)
					console.log("y",y)
					console.log(d.source.name+"->"+d.target.name+": "+d.value)
					tooltip.html(`${d.source.name}->${d.target.name	}: ${d.value}`)
						.style("display", "block")
						.style("color", "white")
						.style("text-align", "left")
						.style("font-size", "15px")
						.style("left", (x+7) + "px")
						.style("top", (y-28) + "px");
					// .style("left", (xScale(d.key) + xScale.bandwidth() / 2) + "px")
					// .style("top", (yScale(d.value) - 28) + "px");
				})
				.on("mouseout", function() {
					tooltip.transition().duration(500).style("opacity", 0);
				})

				svg.append("g")
				.selectAll("text")
				.data(nodes)
				.enter()
				.append("text")
				.attr("x", d => d.x1 + 6) // 文本位于节点右侧一定距离
				.attr("y", d => (d.y1 + d.y0) / 2) // 文本位于节点垂直中心
				.attr("dy", "0.35em") // 垂直对齐
				.text(d => d.name)
				.attr("font-size", "10px") // 字体大小
				.attr("fill", "white"); // 字体颜色


				
				return () => {}
			},
			[selectAll]
		)
	})

	return <div className="chart-container" ref={container} />
}
