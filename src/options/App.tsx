import { hot } from 'react-hot-loader/root';
import './App.scss';

import React, { Component } from 'react';
import {
  SegmentedControl, SegmentedControlItem, Text, View, Box,
  TextInput, Button,
  ListView,
  ListViewHeader,
  ListViewFooter,
  ListViewSection,
  ListViewSectionHeader,
  ListViewRow,
  ListViewSeparator
} from 'react-desktop/macOs';

class App extends Component {
  constructor() {
    super();
    this.state = { selected: 1, email: 'test@gmail.com', password: 'testpasswd' }
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

  handleEmailChange(e) {
    this.setState({email: e.target.value})
  }

  handlePasswordChange(e) {
    this.setState({password: e.target.value})
  }

  login() {
    console.log(this.state)
  }


  renderLoginForm() {
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

  renderLoginForm2() {
    return <View>
      <View

        width="500px"
      >
        <TextInput
          label="Email"
          placeholder="user@example.com"
          defaultValue=""
          onChange={this.handleChange}
        />
      </View>
      <View

        width="500px"
      >
        <TextInput
          label="Password"
          placeholder="******"
          defaultValue=""
          password
          onChange={this.handleChange}
        />
      </View>
      <View

        width="500px"
      >
        <Button color="blue" onClick={() => console.log('Clicked!')}>
          Login
        </Button>
      </View>
    </View>
  }

  renderItems() {
    return [
      this.renderItem(1, '账号', this.renderLoginForm()),
      this.renderItem(2, '其他', <Text>Coming soon...</Text>),
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
