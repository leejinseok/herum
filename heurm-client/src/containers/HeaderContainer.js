import React, { Component } from 'react'
import Header from 'components/Base/Header';
import LoginButton from 'components/Base/Header/LoginButton';

class HeaderContainer extends Component {
    render () {
        return (
            <Header>
                <LoginButton />
            </Header>
        )
    }
}

export default HeaderContainer;