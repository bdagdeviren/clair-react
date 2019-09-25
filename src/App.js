import React from 'react';
import './App.css';
import axios from 'axios';

class Clock extends React.Component {

    REST_ENDPOINT = 'http://127.0.0.1:8081/';

    constructor(props) {
        super(props)
        this.state = {
            formDisplay:"block",
            loadingDisplay:"none",
            loadingMessage: "",
            selected: 'clair',
            file:null
        }
        this.onSubmit = this.onSubmit.bind(this)
        this.onChange = this.onChange.bind(this)
        this.uploadFile = this.uploadFile.bind(this)
    }

    async onSubmit(e){
        console.log("Girdi");
        e.preventDefault();
        let res = await this.uploadFile(this.state.file);
        console.log(res.status)
        if(res.status === 200){
            let parseuploadfileres = JSON.parse(JSON.stringify(res.data));
            let ifilename = parseuploadfileres.filename;
            console.log(ifilename)
            let postclairres = await this.postLayerToClair(ifilename);
            console.log(postclairres.data);
        }
    }

    onChange(e) {
        this.setState({file:e.target.files[0]})
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
        return  await axios.post(this.REST_ENDPOINT+"postlayertoclair", filename,{
            headers: {
                'content-type': 'text/plain'
            }
        });
    }
    


    componentDidMount() {
        setInterval(this.update, 1000)
    }
    update = () => {
        this.setState({
            time: new Date()
        })
    };

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
                        <div id="loading-text">{this.state.loadingMessage}</div>
                    </div>
                </div>
            </div>
        )
    }
}


export default Clock;
