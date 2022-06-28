import React, { useEffect, useState } from 'react';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import './App.css';

function App() {
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [videoSrc, setVideoSrc] = useState('');
  const [subsSrc, setSubsSrc] = useState('');
  const [message, setMessage] = useState('Add a URL and click start to remux to mp4');
  const [url, setUrl] = useState('')
  const ffmpeg = createFFmpeg({
    corePath: '/ffmpeg/ffmpeg-core.js',
    log: true,
    progress: (p) => {
      console.log(p)
    }
  });

  async function doTranscode() {
    setMessage('Loading ffmpeg-core.js');
    await ffmpeg.load();

    setMessage('FFmpeg loaded');
    setMessage('Fetching your video file')
    console.log(`URL: ${url}`)
    let file = await fetchFile(`https://cors-anywhere.kingbri.dev/${url}`)

    ffmpeg.FS('writeFile', 'test.mkv', file);
    setMessage('Remuxing started')
    await ffmpeg.run(
      '-i',
      'test.mkv',
      '-map',
      '0:s',
      'subs.vtt',
      '-map',
      '0:v',
      '-map',
      '0:a:0',
      '-c',
      'copy',
      'test.mp4'
    );

    setMessage('Remuxing complete');

    const data = ffmpeg.FS('readFile', 'test.mp4');
    setVideoSrc(URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' })));

    const subs = ffmpeg.FS('readFile', 'subs.vtt');
    setSubsSrc(URL.createObjectURL(new Blob([subs], { type: 'text/vtt' })));

    setShowVideoPlayer(true)
  };

  function handleURLChange(e) {
    setUrl(e.target.value)
  }

  return (
    <div className="App">
      <p />
      <label>
        Enter URL: <input type="text" value={url} onChange={handleURLChange}></input>
      </label>
      <button onClick={doTranscode}>Start</button>
      <p>{message}</p>
      { showVideoPlayer && 
        <div>
          <br/>
          <video src={videoSrc} controls>
            <track label="English" kind="subtitles" srclang="en" src={subsSrc} default></track>
          </video>
        </div>
      }
    </div>
  );
}

export default App;
