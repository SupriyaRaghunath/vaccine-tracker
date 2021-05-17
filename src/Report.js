import React, { Component } from "react";

/**  @author Supriya PR <supriya.raghunath96@gmail.com> */
/**  @author Sahil Hussain <sahil.hussain113@gmail.com> */

class Report extends Component {
  renderTableData = () => {
    let arr = this.props.finalCenters.map((center) => {
      let { name, address, pincode, availability_18, availability_45 } = center;

      return (
        <tr>
          <td style={{ border: "1px solid white" }}>{`${name}, ${address}`}</td>
          <td style={{ border: "1px solid white" }}>{pincode}</td>
          <td style={{ border: "1px solid white" }}>
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
          <td style={{ border: "1px solid white" }}>
            <tr>
              <td>{availability_18}</td>
            </tr>
            <tr style={{ border: "1px solid white" }}>
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
      <table id="Centers" style={{ border: "1px solid white" }}>
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
