import React from 'react';
import './App.css';

class Clock extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            formDisplay:"none",
            loadingDisplay:"block",
            loadingMessage: "",
            selected: 'clair',
            time: new Date()
        }
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
                            <input type='file' style={{width:"75%"}}/>
                            <input type='submit' style={{float:"right",width:"25%",textAlign:"center"}} value={"Upload"} />
                        </fieldset>
                    </div>
                </div>
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
