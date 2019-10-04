import React from 'react';
import './App.css';
import axios from 'axios';
import ReactTable from 'react-table'
import 'react-table/react-table.css'

class Clock extends React.Component {

    columns = [
        {
            Header: "Vulnerability",
            columns: [
                { accessor: 'layerid', Header: 'Layer\u00a0ID', minWidth: 170 },
                { accessor: 'cve', Header: 'CVE Dictionary Entry', minWidth: 170 },
                { accessor: 'packagename', Header: 'Package\u00a0Name', minWidth: 100 },
                { accessor: 'packageversion', Header: 'Package\u00a0Version', minWidth: 170, align: 'right', format: value => value.toLocaleString(), },
                { accessor: 'severity', Header: 'Severity', minWidth: 170, align: 'right', format: value => value.toLocaleString(), },
                { accessor: 'fixedby', Header: 'Fixed By', minWidth: 170, align: 'right', format: value => value.toFixed(2), },
            ]
        }
      ]; 

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
                <div style={{ maxWidth: "100%", display:this.state.tableDisplay,backgroundColor:"white" }}>
                <ReactTable
                    data={this.createArray(this.state.jsondata)}
                    columns={this.columns}
                    defaultPageSize={20}
                    style={{
                        height: "calc(100vh - 2px)"
                    }}
                    className="-striped -highlight"
                />
                </div>
            </div>
        )
    }
}


export default Clock;
