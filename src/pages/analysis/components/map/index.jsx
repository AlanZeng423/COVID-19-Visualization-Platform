import React, { useRef, useEffect, useState } from "react"
// import echarts from "echarts"
// import "echarts/map/js/china"
import * as d3 from "d3";
// import "d3-geo-projection";
import { BorderBox7 } from "@jiaminghi/data-view-react"
import style from "./index.less"
import { DatePicker } from "antd"
import moment from "moment"
import axios from "@/services"
import Section from "@/components/section"
import Modal from "./modal"

const compare = (property) => {
	return (a, b) => {
		return b[property] - a[property]
	}
}

export default function Radar() {
	const [currentLevel, setCurrentLevel] = useState("province") //当前层级

	const [currentDate, setCurrentDate] = useState("2020-01-30") //当前日期
	function onDateChange(date, dateString) {
		setCurrentDate(dateString)
	}

	const [currentBtn, setCurrentBtn] = useState("confirmed") //当前类型
	const selectBtn = (type) => {
		setCurrentBtn(type)
	}

	const [currentMap, setCurrentMap] = useState("china") //当前地图

	const [visible, setVisible] = useState(false)

	const container = useRef(null)
	useEffect(() => {
		const title =
			currentLevel === "province"
				? `ProvinceDataDaily.json`
				: "CityDataDaily.json"
		axios("ProvinceDataDaily.json").then(
			(res) => {
				let data = [] //热力图数据
				if (true) {
					res.map((item) => {
						if (item.updateTime === currentDate) {
							let obj = {}
							if (currentBtn === "confirmed") {
								obj.name = item.provinceName
								obj.value = Number(item.province_confirmedCount)
							}
							if (currentBtn === "suspected") {
								obj.name = item.provinceName
								obj.value = Number(item.province_suspectedCount)
							}
							if (currentBtn === "cured") {
								obj.name = item.provinceName
								obj.value = Number(item.province_curedCount)
							}
							if (currentBtn === "dead") {
								obj.name = item.provinceName
								obj.value = Number(item.province_deadCount)
							}
							data.push(obj)
						}
					})
				} else {
					const arr = res.filter(
						(item) =>
							item.provinceName.indexOf(currentMap) !== -1 &&
							item.updateTime === currentDate
					)
					arr.map((item) => {
						let obj = {}
						if (currentBtn === "confirmed") {
							obj.name = item.cityName
							obj.value = Number(item.city_confirmedCount)
						}
						if (currentBtn === "suspected") {
							obj.name = item.cityName
							obj.value = Number(item.city_suspectedCount)
						}
						if (currentBtn === "cured") {
							obj.name = item.cityName
							obj.value = Number(item.city_curedCount)
						}
						if (currentBtn === "dead") {
							obj.name = item.cityName
							obj.value = Number(item.city_deadCount)
						}
						data.push(obj)
					})
				}

				if (data.length) {
					console.log("data1", data)
					data = data.sort(compare("value"))
					const yData = [] //排行榜名称
					const barData = [] //排行榜数据
					for (let i = 0; i < 5; i++) {
						barData.push(data[i])
						yData.push(i + data[i].name)
					}
					// D3.js 实现地图
					d3.select(container.current).selectAll("svg").remove();
					const svg = d3.select(container.current)
					.append("svg")
					.attr("width", 700) // 调整 SVG 容器大小
					.attr("height", 300);
						
					d3.json("https://geojson.cn/api/data/china.json").then((china) => {
						const projection = d3.geoMercator()
							.fitSize([700, 300], china);
							
							
						const pathGenerator = d3.geoPath().projection(projection);
							
						svg.selectAll("path")
						.data(china.features)
						.enter().append("path")
						.attr("d", pathGenerator)
						.attr("fill", d => {
							// 根据 data 设置填充颜色
							const value = data.find(item => item.name === d.properties.name)?.value;
							return value ? d3.interpolateReds(value / 100) : "#ccc";
						})
						.on("click", d => {
							// 点击地图处理
							setCurrentMap(d.properties.name);
							console.log(d.properties.name);
							setCurrentLevel("city");
							setVisible(true);
						});
					});

					const legendData = [0,1, 10, 20, 30, 50, 100]; // 这些数据应根据您的具体数据范围进行调整
					const legend = svg.append("g")
					.attr("class", "legend")
					.attr("transform", "translate(20,20)"); // 调整图例位置

					legend.selectAll("rect")
					.data(legendData)
					.enter().append("rect")
					.attr("x", 0)
					.attr("y", (d, i) => i * 20)
					.attr("width", 20)
					.attr("height", 20)
					.attr("fill", d => d3.interpolateReds(d / 100));

					legend.selectAll("text")
					.data(legendData)
					.enter().append("text")
					.attr("x", 30)
					.attr("y", (d, i) => i * 20 + 15)
					.style("fill", "grey")
					// .text(d => `≥ ${d}`);
					.text((d, i, nodes) => {
						// 计算范围的文本
						if (i === 0) {
							return `≤ 0`;
						}
						if (i < nodes.length - 1) {
							return `${d} - ${legendData[i + 1]}`;
						}
						return `≥ ${d}`;
						});

						const sortedData = data.sort(compare("value")).slice(0, 5);
						// const xScale = d3.scaleLinear()
						// .domain([0, d3.max(sortedData, d => d.value)])
						// .range([0, 200]);

						// const yScale = d3.scaleBand()
						// .domain(sortedData.map(d => d.name))
						// .range([300, 450]) // 在 SVG 下部放置排行榜
						// .padding(0.1);

						// svg.selectAll(".bar")
						// 	.data(sortedData)
						// 	.enter().append("rect")
						// 	.attr("class", "bar")
						// 	.attr("x", 500) // 在 SVG 右侧放置排行榜
						// 	.attr("y", d => yScale(d.name))
						// 	.attr("width", d => xScale(d.value))
						// 	.attr("height", yScale.bandwidth());

						// svg.selectAll(".label")
						// 	.data(sortedData)
						// 	.enter().append("text")
						// 	.attr("class", "label")
						// 	.attr("x", d => 500 + xScale(d.value) + 3)
						// 	.attr("y", d => yScale(d.name) + yScale.bandwidth() / 2)
						// 	.attr("dy", ".35em")
						// 	.text(d => d.value);
					const xScale = d3.scaleLinear()
						.domain([0, d3.max(sortedData, d => d.value)])
						.range([0, 100]);

					const yScale = d3.scaleBand()
						.domain(sortedData.map(d => d.name))
						// .domain(sortedData.map((d, i) => `${i + 1}. ${d.name}`)) // 显示排名和省份名称
						.range([0, 150]) // 排行榜的高度
						.padding(0.1);

					// 排行榜的位置
					const rankX = 560; // 假设地图宽度约为700
					const rankY = 150; // 从 SVG 顶部向下50像素开始

					const rankGroup = svg.append("g")
						.attr("transform", `translate(${rankX}, ${rankY})`);

					rankGroup.append("text")
						.attr("class", "rank-title")
						.attr("x", 0)
						.attr("y", -10) // 标题的位置
						.style("font-size", "16px")
						.style("font-weight", "bold")
						.style("fill", "white")
						.text("排行情况");

					rankGroup.selectAll(".bar")
						.data(sortedData)
						.enter().append("rect")
						.attr("class", "bar")
						.attr("x", 0)
						.attr("y", d => yScale(d.name))
						.attr("width", d => xScale(d.value))
						.attr("height", yScale.bandwidth())
						.style("fill", "#9b870c");

					rankGroup.selectAll(".right-label")
						.data(sortedData)
						.enter().append("text")
						.attr("class", "label")
						.attr("x", d => xScale(d.value) + 5) // 文本位于条形图的右侧
						.attr("y", d => yScale(d.name) + yScale.bandwidth() / 2)
						.attr("dy", ".35em")
						.text(d => d.value)
						.style("fill", "white");

					rankGroup.selectAll(".left-label")
						.data(sortedData)
						.enter().append("text")
						.attr("class", "left-label")
						.attr("x", -10) // 设置文本在条形图左侧的位置
						.attr("y", d => yScale(d.name) + yScale.bandwidth() / 2)
						.attr("dy", ".35em")
						.style("text-anchor", "end") // 使文本靠近条形图的左侧边缘
						.text((d, i) => `${i + 1}. ${d.name}`)
						.style("fill", "white");


					// rankGroup.selectAll(".label")
					// .data(sortedData)
					// .enter().append("text")
					// .attr("class", "label")
					// .attr("x", -5) // 将文本位置设置在条形图左侧
					// .attr("y", d => yScale(`${sortedData.indexOf(d) + 1}. ${d.name}`) + yScale.bandwidth() / 2)
					// .attr("dy", ".35em")
					// .style("text-anchor", "end") // 确保文本向左对齐
					// .text(d => d.value);

    
				}

				
				else {
					return;
				}

				// chart.current = echarts.init(container.current)
				// chart.current.setOption(option)

				// chart.current.on("click", (e) => {
				// 	if (currentLevel === "province") {
				// 		setCurrentMap(e.name)
				// 		setCurrentLevel("city")
				// 		setVisible(true)
				// 	}
				// })

				return () => {}
			},
			[currentBtn, currentDate]
		)
	})

	function disabledDate(current) {
		return (
			current < moment(new Date("2020/01/24")) ||
			current > moment(new Date("2020/05/24"))
		)
	}

	function changeLevel(type) {
		setCurrentMap(type)
		setCurrentLevel("province")
	}

	return (
		<Section
			title="疫情地图"
			extra={
				<div style={{ textAlign: "right" }}>
					<DatePicker
						defaultValue={moment(currentDate, "YYYY-MM-DD")}
						format={"YYYY-MM-DD"}
						disabledDate={disabledDate}
						onChange={onDateChange}
					/>
				</div>
			}
		>
			<div className={style["map"]}>
				<div className="switch-btn">
					<span onClick={() => selectBtn("confirmed")}>
						<BorderBox7
							className={
								currentBtn === "confirmed"
									? "activeBtn btn"
									: "btn"
							}
						>
							新增确诊
						</BorderBox7>
					</span>
					<span onClick={() => selectBtn("suspected")}>
						<BorderBox7
							className={
								currentBtn === "suspected"
									? "activeBtn btn"
									: "btn"
							}
						>
							新增疑似
						</BorderBox7>
					</span>
					<span onClick={() => selectBtn("cured")}>
						<BorderBox7
							className={
								currentBtn === "cured" ? "activeBtn btn" : "btn"
							}
						>
							新增治愈
						</BorderBox7>
					</span>
					<span onClick={() => selectBtn("dead")}>
						<BorderBox7
							className={
								currentBtn === "dead" ? "activeBtn btn" : "btn"
							}
						>
							新增死亡
						</BorderBox7>
					</span>
					<span onClick={() => changeLevel("china")}>
						<BorderBox7 className="btn">全国</BorderBox7>
					</span>
				</div>

				<div className="chart-container" ref={container} />
			</div>
			<Modal
				visible={visible}
				setVisible={setVisible}
				provice={currentMap}
				currentDate={currentDate}
				type={currentBtn}
			/>
		</Section>
	)
}
