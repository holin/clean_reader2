import { hot } from 'react-hot-loader/root';
import React, { Component } from 'react';
import {
  SegmentedControl, SegmentedControlItem, Text, View, Box,
  TextInput, Button,
  ListView,
  ListViewSection,
  ListViewRow
} from 'react-desktop/macOs';

import API from '../libs/api'
import Db from '../libs/db'


import './App.scss';

class App extends Component {
  constructor() {
    super({});
    this.state = {
      selected: 1,
      loading: true,
      logined: false,
      email: 'holin.he@gmail.com',
      password: 'heweilin',
      word: '',
      word_saved: false
    }
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({logined: !!Db.account, loading: false})
    }, 100);
  }

  render() {
    return (
      <View
        padding="15px"
        width="500px"
        margin="0 auto"
      >
        <SegmentedControl box>
          {this.renderItems()}
        </SegmentedControl>
      </View>
    );
  }

  handleWordChange(e) {
    this.setState({word: e.target.value})
  }

  handleWordFocus(e) {
    this.setState({word_saved: false})
  }

  handleEmailChange(e) {
    this.setState({email: e.target.value})
  }

  handlePasswordChange(e) {
    this.setState({password: e.target.value})
  }

  createNewWord() {
    console.log(this.state)
    let {word} = this.state
    API.save_word(word).then( rtn => {
      console.log('rtn', rtn)
      if (!!rtn.success) {
        // show sucess
        this.setState({word_saved: true})
      } else {
        // TODO show fail
      }
    })
    .catch(error => console.log('Error:', error))
  }

  login() {
    console.log(this.state)
    let {email, password} = this.state
    API.login(email, password).then( rtn => {
      console.log('rtn', rtn)
      if (!!rtn.success) {
        // TODO show sucess
        console.log('Db.account', Db.account)
        this.setState({logined: true})
      } else {
        // TODO show fail
      }
    })
    .catch(error => console.log('Error:', error))
  }

  logout() {
    this.setState({logined: false})
    Db.remove_account()
  }

  renderLoginForm() {
    if (this.state.loading) {
      return (<View>
        <Text>Loading...</Text>
      </View>)
    }
    if (Db.account) {
      return (<View>
        <ListViewSection >
          <ListViewRow>
            <Text width="100%">
              {Db.account.email}
            </Text>
          </ListViewRow>
          <ListViewRow>
            <Button color="red" onClick={this.logout.bind(this)}>
              Logout
            </Button>
          </ListViewRow>
        </ListViewSection>
      </View>)
    }
    return <ListView width="100%">
      <ListViewSection >
        <ListViewRow>
        <TextInput
          width="100%"
          label="Email"
          placeholder="user@example.com"
          defaultValue={this.state.email}
          onChange={this.handleEmailChange.bind(this)}
        />
        </ListViewRow>
        <ListViewRow>
        <TextInput
          width="100%"
          label="Password"
          placeholder="******"
          defaultValue={this.state.password}
          password
          onChange={this.handlePasswordChange.bind(this)}
        />
        </ListViewRow>
        <ListViewRow>
        <Button color="blue" onClick={this.login.bind(this)}>
          Login
        </Button>
        </ListViewRow>
      </ListViewSection>
    </ListView>
  }

  renderNewWordForm() {
    if (this.state.loading) {
      return (<View>
        <Text>Loading...</Text>
      </View>)
    }
    return <ListView width="100%">
      <ListViewSection >
        <ListViewRow>
        <TextInput
          width="100%"
          label="Word"
          placeholder="new word"
          defaultValue={this.state.word}
          onFocus={this.handleWordFocus.bind(this)}
          onChange={this.handleWordChange.bind(this)}
        />
        </ListViewRow>

        {this.state.word_saved && <ListViewRow><Text width="100%">Saved!</Text></ListViewRow>}

        <ListViewRow>
        <Button color="blue" onClick={this.createNewWord.bind(this)}>
          Create
        </Button>
        </ListViewRow>
      </ListViewSection>
    </ListView>
  }

  renderItems() {
    return [
      this.renderItem(1, '账号', this.renderLoginForm()),
      this.renderItem(2, '添加生词', this.renderNewWordForm()),
    ];
  }

  renderItem(key, title, content) {
    return (
      <SegmentedControlItem
        key={key}
        title={title}
        selected={this.state.selected === key}
        onSelect={() => this.setState({ selected: key })}
      >
        {content}
      </SegmentedControlItem>
    );
  }
}

export default hot(App);
