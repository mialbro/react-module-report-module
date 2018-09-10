import React from 'react';
import PropTypes from 'prop-types';
import GetRecords from './GetRecords';
import css from './style.css';


export default class GetToken extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      csv: 'http://localhost:9130/instance-storage/instances?limit=30&offset=&query=%28title%3D%22%2A%22%20or%20contributors%20adj%20%22%5C%22name%5C%22%3A%20%5C%22%2A%5C%22%22%20or%20identifiers%20adj%20%22%5C%22value%5C%22%3A%20%5C%22%2A%5C%22%22%29%20sortby%20title',
      csvName: 'Circulation',
      error: null,
      isLoaded: false,
      okapiToken: ''
    };
    this.handleCSVchange = this.handleCSVchange.bind(this);
  }
  componentWillMount() {
    fetch('http://localhost:9130/authn/login', {
        method: 'POST',
        body: JSON.stringify({
          'username': 'diku_admin',
          'password': 'admin'
        }),
        headers: new Headers({
          'Content-type': 'application/json',
          'X-Okapi-Tenant': 'diku',
        })
      })
      .then((res) => {
        this.setState({
          okapiToken: res.headers.get('x-okapi-token'),
          isLoaded: true
        });
      })
  };
  handleCSVchange(e) {
    console.log(e);
    this.setState({
      csv: e.target.value,
      csvName: e.target.name
    });
  }

  render() {
    console.log(this.state.okapiToken);

    const csvFiles = [
      {name: 'Circulation', url: 'http://localhost:9130/instance-storage/instances?limit=30&offset=&query=%28title%3D%22%2A%22%20or%20contributors%20adj%20%22%5C%22name%5C%22%3A%20%5C%22%2A%5C%22%22%20or%20identifiers%20adj%20%22%5C%22value%5C%22%3A%20%5C%22%2A%5C%22%22%29%20sortby%20title'},
      {name: 'Users', url: 'http://localhost:9130/users?limit=30&offset=&query=%28cql.allRecords%3D1%29%20sortby%20personal.lastName%20personal.firstName'}
    ];

    let csv = csvFiles.map((data) =>
      <option key={data.name} name={data.name} value={data.url}>{data.name.toUpperCase()}</option>
    );
    // Sends data once all of it is loaded
    if (this.state.isLoaded) {
      return (
        <div className={css.App}>
          <div className={css.item}>
            <h4>Select Data:</h4>
            <select onChange={this.handleCSVchange}>
              {csv}
            </select>
            <GetRecords info={this.state} />
          </div>

        </div>
      )
    }
    else {
      return <div><p>Getting Okapi Token</p></div>
    }
  }
}