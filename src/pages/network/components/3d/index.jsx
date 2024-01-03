import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

// 假设的静态数据
const data = [
    { name: '新型冠状病毒::武汉发现不明原因肺炎', value: 20, color: '#ff8c00' },
    { name: '武汉8名不明原因病毒性肺炎患者已出院', value: 20, color: '#98abc5' },
    { name: '武汉不明原因肺炎已做好隔离', value: 10, color: '#8a89a6' },
    { name: '新型冠状病毒传染来源还未找到', value: 10, color: '#89a9' },
    { name: '春节健康攻略', value: 10, color: '#BB4000' },
    { name: '口罩', value: 20, color: '#BB4112' },
    { name: '武汉封城', value: 30, color: '#BB4222' },
    { name: '野味', value: 10, color: '#BA0011' },
    { name: '人传人', value: 10, color: '#FF0022' },
    { name: '春运', value: 10, color: '#EE0033' },
    { name: '新型冠状病毒', value: 40, color: '#DD0044' },
    { name: '武汉新型冠状病毒患者新增', value: 30, color: '#CC1111' },
    { name: '疫情地图', value: 5, color: '#AA2221' },
    { name: '病毒来源', value: 10, color: '#BB3124' },
    { name: '疫苗', value: 7, color: '#BB34FF' },
    // ... 更多数据
];

const PieChart = () => {
    const ref = useRef();

    useEffect(() => {
        const svg = d3.select(ref.current);
        const width = 1000; // SVG 宽度
        const height = 800; // SVG 高度
        const radius = Math.min(width, height) / 2; // 饼状图半径

        svg.attr('width', width).attr('height', height);
        const g = svg.append('g').attr('transform', `translate(${width / 2}, ${height / 2})`);

        const pie = d3.pie().value(d => d.value);
        const path = d3.arc().outerRadius(radius - 10).innerRadius(0);
        const label = d3.arc().outerRadius(radius - 40).innerRadius(radius - 40);

        const arcs = g.selectAll('.arc')
            .data(pie(data))
            .enter().append('g')
            .attr('class', 'arc');

        arcs.append('path')
            .attr('d', path)
            .attr('fill', d => d.data.color);

    
        arcs.append('text')
            .attr('transform', d => {
                const [x, y] = label.centroid(d);
                return `translate(${x}, ${y})`; // 可以在这里调整x和y的值来改变文本位置
            })
            .attr('dy', '0.35em')
            .attr('fill', 'white') // 更改文本字体颜色为白色
            .attr('text-anchor', 'middle')  // 设置文本的对齐方式
            .text(d => d.data.name);
    }, []);

    return <svg ref={ref}></svg>;
};

export default function Index() {
    return (
        <div>
            <h1>舆情分布饼状图</h1>
            <div className="chart-container">
                <PieChart />
            </div>
        </div>
    );
}
