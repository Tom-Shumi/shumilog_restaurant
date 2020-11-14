import React, { Component } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import common from "../static/common.css";
import {Container, Row, Navbar, Button} from 'react-bootstrap';

class Layout extends Component {
    render () {
        return (
            <div id="wrapper">
                <Head>
                    <title>{this.props.header}|ShumiLog</title>
                    <meta charSet='utf-8' />
                    <meta name='viewport'
                        content='initial-scale=1.0, width=device-width' />
                    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.4.1/dist/css/bootstrap.min.css"
                         integrity="sha256-L/W5Wfqfa0sdBNIKN9cG6QA5F2qx4qICmU2VgLruv9Y=" crossorigin="anonymous" />
                </Head>
                <Navbar className={common.navbarCustom}>
                    <Container>
                        <div className={common.navbarDivLeft}>
                            <a className={common.navbarTitle} href={process.env.REACT_APP_SHUMILOG_URL + "/menu/"}>Shumi Log</a>
                        </div>
                        <div className={common.navbarDivRight}>
                            <a className={common.navbarLink} href={process.env.REACT_APP_SHUMILOG_URL + "/accounts/logout/"}>Log Out</a>
                        </div>
                    </Container>
                </Navbar>
                <Container>
                    <Row>
                        <div className={common.pageContent}>
                            <h1 className={common.pageTitle}>{this.props.title}</h1>
                            {this.props.children}
                            <div className={common.text_align_center}>
                                <Link href={this.props.backURL}>
                                    {this.props.backButtonDisplay == "1" ?
                                        <Button variant="dark" className={common.buttonBack}>戻る</Button>
                                        :
                                        <Button variant="dark" className={common.none}>戻る</Button>
                                    }
                                </Link>
                            </div>
                        </div>
                    </Row>
                </Container>
                <footer className={common.footer}>
                    <Container>
                        <p className={common.footerString}>Copyright &copy; Shumi Log</p>
                    </Container>
                </footer>
            </div>
        );
    }
}
export default Layout;