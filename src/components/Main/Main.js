import React from 'react';
import './fonts.css';
import GraphUI from '../GraphUI';
import styles from './Main.css';
import Plot from 'react-plotly.js';
import update from 'immutability-helper';
import Grid from '../Grid'
import Paneset from '@folio/stripes-components/lib/Paneset';
import Pane from '@folio/stripes-components/lib/Pane';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import { stripesShape } from '@folio/stripes-core/src/Stripes';
import PropTypes from 'prop-types';

export default class Main extends React.Component {

    static manifest = {
      'users': {
        'type': 'okapi',
        'path': 'users?limit=1000&query=%28cql.allRecords%3D1%29%20sortby%20personal.lastName%20personal.firstName'
      },
      'statisticalCodeTypes': {
        'type': 'okapi',
        'path': 'inventory/instances?limit=1000&query=%28title%3D%22undefined%2A%22%20or%20contributors%20adj%20%22%5C%22name%5C%22%3A%20%5C%22undefined%2A%5C%22%22%20or%20identifiers%20adj%20%22%5C%22value%5C%22%3A%20%5C%22undefined%2A%5C%22%22%29%20sortby%20title'
      },
      'locations': {
        'type': 'okapi',
        'path': 'locations?limit=1000&query=cql.allRecords=1%20sortby%20name'
      },
      'classificationTypes': {
        'type': 'okapi',
        'path': 'classification-types?limit=1000&query=cql.allRecords=1%20sortby%20name'
      },
      'instanceTypes': {
        'type': 'okapi',
        'path': 'instance-types?limit=1000&query=cql.allRecords=1%20sortby%20name'
      },
      'instanceFormats': {
        'type': 'okapi',
        'path': 'instance-formats?limit=1000&query=cql.allRecords=1%20sortby%20name'
      },
      'contributorNameTypes': {
        'type': 'okapi',
        'path': 'contributor-name-types?limit=1000&query=cql.allRecords=1%20sortby%20ordering'
      },
      'contributorTypes': {
        'type': 'okapi',
        'path': 'contributor-types?limit=1000&query=cql.allRecords=1%20sortby%20name'
      },
      'identifierTypes': {
        'type': 'okapi',
        'path': 'identifier-types?limit=1000&query=cql.allRecords=1%20sortby%20name'
      },
      'notifications': {
        'type': 'okapi',
        'path': 'notify'
      },
    }

    constructor(props) {
        super(props);
        this.state = {
          title: '',
          width: window.innerWidth,
          height: window.innerHeight,
          useResizeHandler: true,
          size: window.innerWidth * 0.8,
          style: { width: '100%', height: '100%' },
          data: [{ type: 'bar', opacity: 1 }],
          layout: {
            height: 1000,
            title: '',
            xaxis: { title: '' },
            yaxis: {title: String}
          },
          defaultHeight: 500,
          defaultWidth: 1000,
          graphTypes: ['Bar', 'Line', 'Pie'],
          records: [],
          propertyObjectArray: [],
          isLoaded: Boolean,
          checkboxData: [],
        };
        this.currWidth = window.innerWidth;
        this.currHeight = window.innerHeight;
        this.dataArr = [];
        this.longRecords = [];
        this.checkboxDataMem = [];
        this.flatRecords = {};
    }

    componentDidMount() {
      window.addEventListener('resize', this.handleResize);
      this.handleWindowResize();
    }

    componentWillUnmount() {
      window.removeEventListener('resize', this.handleResize);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
      if (this.currWidth !== window.innerWidth || this.currHeight !== window.innerHeight) {
        if (!(isNaN(this.props.width)) === true) {
          this.setState(update(this.state, {size: {$set: Number(this.props.width)}})); // Update the slider with the value from the window changing
        }
        this.currWidth = window.innerWidth;
        this.currHeight = window.innerHeight;
      }
    }

    /*  Updates the height and width of graph  */
    handleWindowResize = () => {
      this.setState(update(this.state, {
        layout: {width: {$set: window.innerWidth * 0.8},
        height: {$set: window.innerWidth * 0.8 * 0.642857143 }
      }}));
    }

    updateSize = e => {
      this.setState(update(this.state, {
        size: {$set: e.target.value},
        layout: {
          width: {$set: e.target.value},
          height: {$set: e.target.value * 0.642857143 }
        }}));
    }

    changeGraphType(newType) {
        let newGraph = [{}];

        newType = newType.toLowerCase();

        if (newType === 'pie') {
             newGraph = [{
                labels: this.state.data[0].x,
                values: this.state.data[0].y,
                type: newType,
                opacity: this.state.data[0].opacity
            }]
        }
        else if (this.state.data[0].type === 'pie') {
             newGraph = [{
                x: this.state.data[0].labels,
                y: this.state.data[0].values,
                type: newType,
                opacity: this.state.data[0].opacity
            }]
        }
        else {
            newGraph = [{
                x: this.state.data[0].x,
                y: this.state.data[0].y,
                type: newType,
                opacity: this.state.data[0].opacity
            }]
        }
        this.setState({data: newGraph})
    }

    getCount(arr) {
        var lastElement = arr[0];
        var count = 1;

        var countArr = [];

        for (var x = 1; x <= arr.length; x++) {
            if (arr[x] === lastElement) {
                count++;
            }
            else {
                countArr.push(count);
                count = 1;
                lastElement = arr[x];
            }
        }
        return countArr;
      }

      removeDuplicates = (arr) => {
        var noDupes = [];
        noDupes.push(arr[0])
        var lastElement = arr[0];

        for (var x = 1; x < arr.length; x++) {
            if (arr[x] !== lastElement) {
                noDupes.push(arr[x]);
                lastElement = arr[x];
            }
        }
        return noDupes;
    }

    setOpacity = e => {
      let opacity = e.target.value / 100;
      let newData = [{
          x: this.state.data[0].x,
          y: this.state.data[0].y,
          type: this.state.data[0].type,
          opacity: opacity
      }];
      this.setState({ data: newData });
    }

    updateAxesLabels(axes) {
      let newLayout = {
        title: this.state.title.toUpperCase(),
        xaxis: {
          title: axes.x.type
        },
        yaxis: {
          title: axes.y.type
        }
      }
      this.setState({layout: newLayout})
    }

    /* Updates the x and y values and the axis labels */
    updateGraph = (data) => {
      let temp = [{
        x: data.x.values,
        y: data.y.values,
        type: this.state.data[0].type,
        opacity: this.state.data[0].opacity
      }]
      this.setState({ data: temp })
      let newLayout = {
        title: this.state.title.toUpperCase(),
        xaxis: {
          title: data.x.type
        },
        yaxis: {
          title: data.y.type
        }
      }
      this.setState({layout: newLayout});
    }

    /*  Store the records in state as an array of objects and store the name of the data and the actual data in the each object */
    setGraphObj = (title) => {
      let data = this.props.resources;
      let propertyArray = Object.keys(data[title].records[0][title][0]); // array of properties from the first key's value
      let res = [];
      // Iterate the properties
      for (let prop in data[title].records[0][title][0]) {
        let propertyObject = {
          type: prop,
          data: []
        }
        // Pass through the corresponding array of data and push values into propertyObject
        for (let obj of data[title].records[0][title]) {
          propertyObject.data.push(obj[prop]);
        }
        res.push(propertyObject);
      }
      this.checkboxDataMem[title] = res;
      this.setState({checkboxData: res, title: title});
    }

    changeSet = (e) => {
      let title = e.target.value;
      if (title in this.checkboxDataMem)
        this.setState({checkboxData: this.checkboxDataMem[title]});
      else if (!(title in this.checkboxDataMem)) {

        this.setGraphObj(title);
        //this.setState({checkboxData: this.checkboxDataMem[title]});
      }
    }

    render() {
        return (
          <Paneset isRoot>
            <Pane defaultWidth="20%" paneTitle="Graph User Interface" >
              <GraphUI
                  size={this.state.size}
                  opacity={this.state.data[0].opacity * 100}
                  title={this.state.title}
                  updateGraph={this.updateGraph}
                  data={this.props.resources}
                  checkboxData={this.state.checkboxData}
                  setOpacity={this.setOpacity}
                  updateSize={this.updateSize}
                  changeType={this.changeGraphType}
                  values={this.state.graphTypes}
                  changeSet={this.changeSet}
                  width={this.state.layout.width}
                  defaultHeight={this.state.layout.height}
                  handleWindowResize={this.handleWindowResize}
              />
              </Pane>
            <Pane defaultWidth="fill" paneTitle="Graph" >
              <Plot
                data={this.state.data}
                layout={this.state.layout}
                useResizeHandler={this.state.useResizeHandler}
                style={this.state.style}
              />
            </Pane>
            <Pane defaultWidth="fill" paneTitle="Table" >
              <Grid
                title={this.state.title}
                resources={this.props.resources}
              />
            </Pane>
          </Paneset>
        );
    }
}
