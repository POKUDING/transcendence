import styles from './mainbox.module.css';
import React from 'react';

const MatchingButton = () => {
	return (
		<div style={{ textAlign: 'center', marginTop: '50vh', transform: 'translateY(-50%)' }}>
		<h1>Matching</h1>
		<button>일반</button>
		<button>랭크</button>
	  </div>
	)
}

export default MatchingButton;