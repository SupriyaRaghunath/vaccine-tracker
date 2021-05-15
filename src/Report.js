import React, { Component } from "react";

class Report extends Component {
  renderTableData = () => {
    let arr = this.props.finalCenters.map((center) => {
      let { name, address, pincode, availability_18, availability_45 } = center;

      return (
        <tr>
          <td>{`${name}, ${address}`}</td>
          <td>{pincode}</td>
          <td>
            {availability_18 && (
              <tr>
                <td>18</td>
              </tr>
            )}
            {availability_45 && (
              <tr>
                <td>45</td>
              </tr>
            )}
          </td>
          <td>
            <tr>
              <td>{availability_18}</td>
            </tr>
            <tr>
              <td>{availability_45}</td>
            </tr>
          </td>
        </tr>
      );
    });

    return arr;
  };
  render() {
    return (
      <table id="students">
        <thead>
          <tr>
            <th>Center</th>
            <th>Pincode</th>
            <th>Age</th>
            <th>Available Capacity</th>
          </tr>
        </thead>
        <tbody>{this.renderTableData()}</tbody>
      </table>
    );
  }
}

export { Report };
