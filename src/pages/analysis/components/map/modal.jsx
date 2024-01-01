import React, { useRef, useEffect, useState } from "react"
import * as d3 from "d3"
import { Modal } from "antd"
import style from "./index.less"
import axios from "@/services"
import _ from "lodash"

const TYPE_OBJ = {
    confirmed: "city_confirmedCount",
    suspected: "city_suspectedCount",
    cured: "city_curedCount",
    dead: "city_deadCount",
}

const PROVINCE_CODES = {
    '北京': '110000',
    '天津': '120000',
    '河北': '130000',
    '山西': '140000',
    '内蒙古': '150000',
    '辽宁': '210000',
    '吉林': '220000',
    '黑龙江': '230000',
    '上海': '310000',
    '江苏': '320000',
    '浙江': '330000',
    '安徽': '340000',
    '福建': '350000',
    '江西': '360000',
    '山东': '370000',
    '河南': '410000',
    '湖北': '420000',
    '湖南': '430000',
    '广东': '440000',
    '广西': '450000',
    '海南': '460000',
    '重庆': '500000',
    '四川': '510000',
    '贵州': '520000',
    '云南': '530000',
    '西藏': '540000',
    '陕西': '610000',
    '甘肃': '620000',
    '青海': '630000',
    '宁夏': '640000',
    '新疆': '650000',
    '台湾': '710000',
    '香港': '810000',
    '澳门': '820000'
};




export default function Province({ visible, setVisible, provice, currentDate, type }) {
    const container = useRef(null)
    const [geoJson, setGeoJson] = useState(null);
    const originData = useRef({})
	console.log("provinceName",provice)
	// 创建提示框元素
	const tooltip = d3.select(container.current).append("div")
		.attr("class", "tooltip")
		.style("opacity", 0)
		.style("position", "absolute")
		.style("background-color", "white")
		.style("padding", "5px")
		.style("border-radius", "5px")
		.style("border", "1px solid gray");

    // 加载原始数据
    useEffect(() => {
        axios("CityDataDaily.json").then((res) => {
            originData.current = _.chain(res)
                .reduce((obj, d) => {
                    const key = d.provinceName
                    if (!obj[key]) {
                        obj[key] = []
                    }
                    obj[key].push(d)
                    return obj
                }, {})
                .value()
        })
    }, [])

    // 获取省份对应的 GeoJSON 数据
    // useEffect(() => {
    //     if (!visible || !province) return

    //     // const geoJsonUrl = `https://geojson.cn/api/data/${province}.json`; // 请根据实际情况修改 URL
	// 	const geoJsonUrl = `https://geojson.cn/api/data/110000.json`; // 请根据实际情况修改 URL

    //     d3.json(geoJsonUrl).then(data => {
    //         setGeoJson(data);
    //     }).catch(error => console.error("Error loading the GeoJSON data", error));
    // }, [province, visible])

    // 使用 D3.js 绘制地图
    useEffect(() => {
        // if (!visible || !geoJson) return

        const data = _.chain(originData.current)
            .find((d, k) => k.includes(provice))
            .filter((d) => d.updateTime === currentDate)
            .reduce((obj, d) => {
                const key = d.cityName
				// const key = d.cityName.replace('市', '').trim(); // 移除城市名称中的“市”和额外的空格
                if (!obj[key]) {
                    obj[key] = []
                }
                obj[key].push(d)
                return obj
            }, {})
            .map((d, k) => ({
                name: k,
                value: _.sumBy(d, d1 => +d1[TYPE_OBJ[type]]),
            }))
            .value()

		if (data.length) {

			// const svg = d3.select(ref.current)
			// svg.selectAll("*").remove() // 清除之前的绘制内容
			
			d3.select(container.current).selectAll("svg").remove();
			d3.select(container.current).style("margin-top", "50px"); 
			const svg = d3.select(container.current)
			.append("svg")
			.attr("width", 600) // 调整 SVG 容器大小
			.attr("height", 500);

			svg.append("text")
			.attr("x", 300) // 标题的 x 位置
			.attr("y", 400) // 标题的 y 位置
			.attr("text-anchor", "middle") // 使标题居中
			.style("font-size", "30px") // 字体大小
			.text(provice)// 显示省份名称
			.style("fill", "white"); // 字体颜色
			// if (!visible || !provice) return

			// const geoJsonUrl = `https://geojson.cn/api/data/${province}.json`; // 请根据实际情况修改 URL
			// const geoJsonUrl = `https://geojson.cn/api/data/110000.json`; // 请根据实际情况修改 URL
			const provinceCode = PROVINCE_CODES[provice];
			const geoJsonUrl = `https://geojson.cn/api/data/${provinceCode}.json`; 
			console.log("geoJsonUrl",geoJsonUrl)

			

			d3.json(geoJsonUrl).then((prov) => {
				// console.log("prov",prov)
				console.log("datainmap",data)
				const projection = d3.geoMercator()
					.fitSize([600, 300], prov)
					// .translate([-2000, 900])
					// .center([0, 0])
					// // .translate([300, 150])	
					// .scale(1200)
					;
				
				const pathGenerator = d3.geoPath().projection(projection);
				svg.selectAll("path")
					.data(prov.features)
					.enter().append("path")
					.attr("d", pathGenerator)
					.attr("fill", d => {
						// const cityData = data.find(city => city.name === d.properties.name)
						// return cityData ? d3.interpolateReds(cityData.value / 100) : "#ccc"
						// 根据 data 设置填充颜色
						console.log("d",d)
						const value = data.find(item => item.name === d.properties.fullname)?.value;
						console.log("value",value)
						console.log("FILLLL")
						return value ? d3.interpolateReds(value / 100) : "#ccc";
					})
					.on("mouseover", function(d, event) {
						tooltip.transition().duration(200).style("opacity", 1);
						tooltip.html(`城市: ${d.properties.fullname}<br>确诊人数:${data.find(item => item.name === d.properties.fullname)?.value}`)
							.style("left", (event.pageX + 5) + "px")
							.style("top", (event.pageY - 28) + "px");
						// const matchedItem = data.find(item => item.name === d.properties.fullname);
						// if (matchedItem) {
						// 	tooltip.transition().duration(200).style("opacity", 1);
						// 	tooltip.html(`城市: ${matchedItem.name}<br>确诊人数: ${matchedItem.value}`)
						// 		.style("left", (event.pageX + 5) + "px")
						// 		.style("top", (event.pageY - 28) + "px");
						// }
					})
					.on("mouseout", function() {
						tooltip.transition().duration(500).style("opacity", 0);
					});
			});

			// const projection = d3.geoMercator().fitSize([svg.attr("width"), svg.attr("height")], geoJson)
			// const pathGenerator = d3.geoPath().projection(projection)

			// svg.selectAll("path")
			//     .data(geoJson.features)
			//     .enter()
			//     .append("path")
			//     .attr("d", pathGenerator)
			//     .attr("fill", d => {
			//         const cityData = data.find(city => city.name === d.properties.name)
			//         return cityData ? d3.interpolateReds(cityData.value / 100) : "#ccc"
			//     })
			//     .attr("stroke", "#fff")

			//     // 可以添加更多交互和样式
		}

    }, [visible, geoJson, provice, currentDate, type])

    return (
        <Modal
            className={style["province-modal"]}
            footer={false}
            visible={visible}
            onCancel={() => setVisible(false)}
            width={"50vw"}
            bodyStyle={{
                height: "60vh",
            }}
        >
            <div className="chart-container" ref={container}></div>
        </Modal>
    )
}
