import React, { useState, useEffect } from "react"
import { Layout } from "antd"
import {
	FullScreenContainer,
	BorderBox7,
	Decoration5,
} from "@jiaminghi/data-view-react"
import style from "./index.less"
import Clock from "@/components/clock"
import { Link } from "react-router-dom"
import { ConfigProvider } from "antd"
import zhCN from "antd/es/locale/zh_CN"
import history from "@/router/history"

const { Header, Content } = Layout

export default function BasicLayout({ children }) {
    const [pathname, setPathname] = useState(history.location.pathname)

    useEffect(() => {
        history.listen(() => {
            setPathname(history.location.pathname)
        })
    }, [])

    function setActive(path) {
        return pathname === path ? 'active-menu' : ''
    }
    
	return (
		<FullScreenContainer>
			<Layout className={style["layout"]}>
				<Header className="layout-header">
					<div>
						<p></p>
						<Clock />
						<p></p>
						<p>天津大学 可视化与可视分析课程大作业</p>
						<p>小组成员: 曾俊豪 杜伟乐 吴润之</p>
					</div>
					<div className="layout-header-title">
						<div className="custom-font">COVID-19 疫情趋势模拟与综合舆论分析可视化平台</div>
						<Decoration5
							color={["#45b8d1", "#45b8d1"]}
							className="title-decorate"
						/>
					</div>
					<div className="layout-header-menu">
						<span>
							<BorderBox7>
								<span className={`menu-item ${setActive('/analysis')}`}>
									<Link to="/analysis">疫情分析</Link>
								</span>
							</BorderBox7>
						</span>
						<span>
							<BorderBox7>
								<span className={`menu-item ${setActive('/option')}`}>
									<Link to="/option">舆情信息</Link>
								</span>
							</BorderBox7>
						</span>
						<span>
							<BorderBox7>
								<span className={`menu-item ${setActive('/network')}`}>
									<Link to="/network">舆情分布</Link>
								</span>
							</BorderBox7>
						</span>
					</div>
				</Header>
				{/* <BorderBox1 className="border-padding-3 layout-border"> */}
				<Content className="layout-content">
					<ConfigProvider locale={zhCN}>{children}</ConfigProvider>
				</Content>
				{/* </BorderBox1> */}
			</Layout>
		</FullScreenContainer>
	)
}
