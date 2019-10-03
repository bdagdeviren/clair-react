import React from 'react';
import { forwardRef } from 'react'
import './App.css';
import axios from 'axios';
import MaterialTable from "material-table";

import AddBox from '@material-ui/icons/AddBox';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';

class Clock extends React.Component {
    columns = [
        { field: 'layerid', title: 'Layer\u00a0ID', minWidth: 170 },
        { field: 'cve', title: 'CVE Dictionary Entry', minWidth: 170 },
        { field: 'packagename', title: 'Package\u00a0Name', minWidth: 100 },
        { field: 'packageversion', title: 'Package\u00a0Version', minWidth: 170, align: 'right', format: value => value.toLocaleString(), },
        { field: 'severity', title: 'Severity', minWidth: 170, align: 'right', format: value => value.toLocaleString(), },
        { field: 'fixedby', title: 'Fixed By', minWidth: 170, align: 'right', format: value => value.toFixed(2), },
      ];

      tableIcons = {
        Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
        Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
        Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
        Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
        DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
        Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
        Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
        Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
        FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
        LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
        NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
        PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
        ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
        Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
        SortArrow: forwardRef((props, ref) => <ArrowUpward {...props} ref={ref} />),
        ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
        ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
      };
    

    REST_ENDPOINT = 'http://10.150.0.247:8081/';

    constructor(props) {
        super(props)
        this.state = {
            formDisplay:"block",
            loadingDisplay:"none",
            loadingText: "",
            tableDisplay: "none",
            selected: 'clair',
            file:null,
            jsondata: [],
        }
        this.onSubmit = this.onSubmit.bind(this)
        this.onChange = this.onChange.bind(this)
        this.uploadFile = this.uploadFile.bind(this)
    }

    createArray(jsonData) {
        if(typeof jsonData !== 'undefined' ){
          const data = [];
          for(let i = 0;i<jsonData.length;i++){
              for(let j=0;j<jsonData[i]["Vulnerability"].length;j++){
                  const split = jsonData[i]["Vulnerability"][j].split(",,");
                  data.push( this.createData(jsonData[i]["Layer"],split[0],split[2],split[1],split[3],split[4]) );
              }
          }
          return data;
        }
      }
      
      createData(layerid, packagename,cve, packageversion, severity,fixedby) {
        return { layerid, packagename, cve, packageversion, severity, fixedby };
      }

    

    async onSubmit(e){
        this.setState({formDisplay:"none",loadingDisplay:"block",loadingText: "File Upload Started"})
        e.preventDefault();
        let res = await this.uploadFile(this.state.file);
        console.log(res.status);
        if(res.status === 200){
            this.changeText("File Upload Successful");
            let parseuploadfileres = JSON.parse(JSON.stringify(res.data));
            this.sleep(5000).then(()=>{
                this.changeText("Layer Post Started");
            });
            let postclairres = await this.postLayerToClair(parseuploadfileres["Filename"]);
            this.changeText("Layer Post Successful");
            if(postclairres.status === 200) {
                this.setState({
                    loadingText: "Waiting Clair Response"
                });
                let postfileres = JSON.parse(JSON.stringify(postclairres.data));
                let parseclairres = await this.parsedLayersVulnerability(postfileres);
                this.setState({jsondata: parseclairres.data,tableDisplay:"block",loadingDisplay:"none"});
            }
        }
        else {

        }
    }

    onChange(e) {
        this.setState({file:e.target.files[0]})
    }

    sleep(time){
        return new Promise((resolve) => setTimeout(resolve,time));
    }

    changeText(text){
        this.setState({
            loadingText: text
        });
    }

    async uploadFile(file){
        const formData = new FormData();
        formData.append('file',file)
        return  await axios.post(this.REST_ENDPOINT+"upload", formData,{
            headers: {
                'content-type': 'multipart/form-data'
            }
        });
    }

    async postLayerToClair(filename){
        return  await axios.post(this.REST_ENDPOINT+"postlayertoclair?filename="+filename,"",{
            headers: {
                'content-type': 'text/plain'
            }
        });
    }

    async parsedLayersVulnerability(layers){
        return  await axios.post(this.REST_ENDPOINT+"parsedlayervulnerability",layers,{
            headers: {
                'content-type': 'text/plain'
            }
        });
    }

    render() {
        return (
            <div>
                <form onSubmit={ this.onSubmit }>
                    <div id={"loading"} style={{display:this.state.formDisplay,color:"white"}}>
                        <div className="form-container">
                            <div style={{marginBottom:"10px", textAlign:"center"}}>
                                DOCKER SERVİCE
                            </div>
                            <fieldset style={{border:"1px solid",padding:"10px",marginBottom:"10px",textTransform: "uppercase"}}>
                                <legend>Type:</legend>
                                <div style={{width:"100%"}}>
                                    <input type="radio" id='clair' value="clair" checked={this.state.selected === 'clair'} onChange={(e) => this.setState({ selected: e.target.value })} style={{marginBottom:"10px"}} />
                                    Push Docker Image To Harbor Registry
                                </div>
                                <div style={{width:"100%"}}>
                                    <input type="radio" id='harbor' value="harbor" checked={this.state.selected === 'harbor'} onChange={(e) => this.setState({ selected: e.target.value })}  />
                                    Scanning Docker images with CoreOS Clair
                                </div>
                            </fieldset>
                            <fieldset style={{border:"1px solid",padding:"10px",textTransform: "uppercase" }}>
                                <legend>Select File:</legend>
                                <input type='file' style={{width:"75%"}} onChange={ this.onChange } />
                                <button type='submit' style={{float:"right",width:"25%",textAlign:"center"}} >Upload</button>
                            </fieldset>
                        </div>
                    </div>
                </form>
                <div id={"loading"} style={{display:this.state.loadingDisplay}}>
                    <div className="loading-container">
                        <div className="loading"></div>
                        <div id="loading-text">{this.state.loadingText}</div>
                    </div>
                </div>
                <div style={{ maxWidth: "100%", display:this.state.tableDisplay }}>
                    <MaterialTable
                    style={{height:"100vh"}}
                    options={{
                        exportButton: true,
                        exportFileName: "vulnerability",
                        rowStyle: {
                          backgroundColor: '#EEE',
                        }
                      }}
                    icons={this.tableIcons}
                    columns={this.columns}
                    data={this.createArray(this.state.jsondata)}
                    title="Demo Title"
                    />
                </div>
            </div>
        )
    }
}


export default Clock;
