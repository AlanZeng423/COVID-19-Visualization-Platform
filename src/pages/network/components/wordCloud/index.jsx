import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import cloud from "d3-cloud";
import axios from "@/services";
import Section from "@/components/section";
import store from "../../store";
import { reaction } from 'mobx';

export default function WordCloud() {
    const container = useRef(null);

    useEffect(() => {
        function drawWordCloud(words) {
            // 清除旧的 SVG
            d3.select(container.current).selectAll("svg").remove();

            const [width, height] = [400, 400];  // 确保这个尺寸与容器的大小一致

            const svg = d3.select(container.current)
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", `translate(${width / 2},${height / 2})`);

            function draw(words) {
                svg.selectAll("text")
                    .data(words)
                    .enter().append("text")
                    .style("font-size", d => `${d.size}px`)
                    .style("fill", () => `rgba(${[...Array(3)].map(() => Math.round(Math.random() * 120)).join(",")}, 1)`)
                    .attr("text-anchor", "middle")
                    .attr("transform", d => `translate(${[d.x, d.y]})rotate(${d.rotate})`)
                    .text(d => d.text);
            }

            const layout = cloud()
                .size([width, height])
                .words(words.map(d => ({ text: d.name, size: d.value * 150 })))  // 调整大小系数
                .padding(5)
                .rotate(() => ~~(Math.random() * 2) * 90)
                .fontSize(d => d.size)
                .on("end", draw);
            layout.start();
            
        }
        function getSeries(date) {
            console.log(date);
            //console.log("Fetching data for date:", date);  // 打印当前正在请求的日期
            axios(`weibo_wordcloud_json/${date}.json`).then(res => {
                //console.log("Data received:", res.data);  // 打印接收到的数据
                drawWordCloud(res.data);
            }).catch(error => {
                console.error("Error fetching data:", error);  // 打印任何错误信息
            });
        }
        const dispose = reaction(
            //console.log("Current date format changed to:", store.currentDateFormat),  // 打印更新后的日期
            () => store.currentDateFormat,
            (date) => {
                //console.log("Current date format changed to:", date);  // 打印更新后的日期
                getSeries(date);
            }
        );
        getSeries(store.currentDate.format("YYYY-M-D"));
        return () => dispose();
    }, [store.currentDateFormat]);  // 添加了依赖项
    return (
        		<Section title="微博词云">
        			<div className="chart-container" ref={container} />
        		</Section>
        	)
}
