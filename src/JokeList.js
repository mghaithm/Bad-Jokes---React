import React, { Component } from 'react'
import { v4 as uuidv4 } from 'uuid';
import Joke from './Joke';
import axios from 'axios'  
import "./JokeList.css";
import FlipMove from 'react-flip-move';

export default class JokeList extends Component {
    static defaultProps = {
        numJokesToGet: 10
    }
    constructor(props){
        super(props); 
        this.state = { jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]"),
        lodaing: false
        }
        this.seenJokes = new Set(this.state.jokes.map(j => j.text));
        this.handleClick = this.handleClick.bind(this);
    }
    componentDidMount(){
        if(this.state.jokes.length === 0) this.getJokes();
    }
    
    async getJokes() {
        try{
        let jokes = [] ;
        while(jokes.length < this.props.numJokesToGet) {
        let res = await axios.get("https://icanhazdadjoke.com/", {headers: {Accept : "application/json"}})
        let newJoke = res.data.joke;
        if(!this.seenJokes.has(newJoke)) {
        jokes.push({id: uuidv4(), text: newJoke, votes: 0});
        }else {
            console.log("found dulplicate");
            console.log(newJoke);
        }
        }
        this.setState(st => ({lodaing: false, jokes: [...st.jokes, ...jokes]}),
        () => window.localStorage.setItem("jokes", JSON.stringify(
            this.state.jokes)) );
        }
        catch (e){
            alert(e);
            this.setState({lodaing: false})
        }
        } 

        handleClick(){
            this.setState({lodaing:true},this.getJokes);
            
        }

        handleVote(id ,delta) {
            this.setState(st => ({
                jokes: st.jokes.map(j => j.id === id ? { ...j, votes: j.votes+delta} : j 
                    )
                }),
            () => window.localStorage.setItem("jokes", JSON.stringify(
                this.state.jokes))
            );
        } 

    render() {
        if(this.state.lodaing){
            return(
                <div className="JokeList-spinner">
                    <i className="far fa-8x fa-laugh fa-spin" />
                    <h1 className="JokeList-title">Loadaing...</h1>
                </div>
            )
        }
        let jokes = this.state.jokes.sort((a,b) => b.votes - a.votes);
        return (
            
            <div className="JokeList">
                <div className="JokeList-sidebar">
                    <h1 className="JokeList-title"><span>Bad</span> Jokes</h1>
                    <img src='https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg' alt=""/>
                    <button className="JokeList-getmore" onClick={this.handleClick}>New Jokes!</button>
                </div>

               <div className="JokeList-jokes">
               <FlipMove>
                   {jokes.map(j => (<Joke 
                   key={j.id} 
                   votes={j.votes} 
                   text={j.text} 
                   upvote={() => this.handleVote(j.id, 1)}
                   downvote={() => this.handleVote(j.id, -1)}
                   />))}
                 </FlipMove>
                 
               </div>
            </div>
        )
    }
}
