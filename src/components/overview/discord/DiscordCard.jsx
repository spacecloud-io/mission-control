import React from 'react';
import { Card } from 'antd';
import discordSvg from '../../../assets/discordIcon.svg';
import './discord.css';

const DiscordCard = () => {

    return (
        <Card className="discord-card">
            <h2>Got some questions?</h2>
            <p>Ask it on our Discord channel and get help from our opensource 
                community. We love getting nudged again and again 😛 </p>
            <a href="https://discordapp.com/invite/ypXEEBr" target="_blank">
                <button className="discord-btn">
                <img src={discordSvg} style={{marginRight:"2%"}}/>Join our discord community</button></a>
        </Card>
    );
}

export default DiscordCard;