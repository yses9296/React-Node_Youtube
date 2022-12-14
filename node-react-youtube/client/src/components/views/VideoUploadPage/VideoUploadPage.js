import React, { useState } from 'react';
import Axios from 'axios'
// Dropzone import
import Dropzone from 'react-dropzone'
// CSS import
import { Typography, Button, Form, message, Input, Icon } from 'antd';

import { useSelector } from "react-redux";

const { Title } = Typography;
const { TextArea } = Input;

const PrivateOptions = [
  {value: 0, label: "Private"},
  {value: 1, label: "Public"}
]
const CategoryOptions = [
  { value: 0, label: "Film & Animation" },
  { value: 0, label: "Autos & Vehicles" },
  { value: 0, label: "Music" },
  { value: 0, label: "Pets & Animals" },
  { value: 0, label: "Sports" },
]

const VideoUploadPage = (props) => {
  const user = useSelector(state => state.user);

  const [VideoTitle, setVideoTitle] = useState('');
  const [Description, setDescription] = useState('');
  const [Private, setPrivate] = useState(0);
  const [Category, setCategory] = useState("File & Animation");

  const [FilePath, setFilePath] = useState('');
  const [Duration, setDuration] = useState('');
  const [ThumbnailPath, setThumbnailPath] = useState("")

  // onChangeHandler
  const onChangeTitle = (e) => {
    setVideoTitle(e.target.value)
  }
  const onChangeDesc = (e) => {
    setDescription(e.target.value)
  }
  const onPrivateChange = (e) => {
    setPrivate(e.target.value)
  }
  const onCategoryChange = (e) => {
    setCategory(e.target.value)
  }

  //onDropHandler
  const onDrop = (files) => {
    let formData = new FormData();
    const config = {
      header: { 'content-type': 'multipart/form-data' }
    }
    formData.append('file', files[0])

    console.log(files)

    Axios.post('/api/video/uploadfiles', formData, config)
    .then(response  => {
      if(response.data.success) {
        console.log(response.data)//video 업로드 서버 응답

        let variable = {
          filePath: response.data.filePath,
          fileName: response.data.fileName
        }

        setFilePath(response.data.filePath)

        //썸네일 생성
        Axios.post('/api/video/thumbnail', variable)
        .then(response =>{
          if(response.data.success) {
            console.log(response.data);
            setDuration(response.data.fileDuration);
            setThumbnailPath(response.data.thumbsFilePath);
          } 
          else {
            alert("Failed to make the thumbnails")
          }
        })

      }
      else {
        alert("failed to save the video in server")
      }
    });
  }


  // onSubmitHandler
  const onSubmit = (e) => {
    e.preventDefault();

    const variables = {
      writer: user.userData._id,
      title: VideoTitle,
      description: Description,
      privacy: Private,
      filePath: FilePath,
      category: Category,
      duration: Duration,
      thumbnail: ThumbnailPath
    }

    Axios.post('/api/video/uploadVideo', variables)
    .then(response => {
      if(response.data.success){
        console.log(response.data)
        message.success('video Uploaded Successfully')

        setTimeout( () => {
          props.history.push('/')
        }, 3000) //3초 후 메인페이지로 이동

      }
      else {
        alert("Failed to upload video")
      }
    })
  }

  return (
    <div style={{ maxWidth: '700px', margin: '2rem auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Title level={2} >Upload Video</Title>
      </div>

      <Form onSubmit={onSubmit}>
        <div>
          {/* Drop zone */}
          <Dropzone
              onDrop={onDrop}
              multiple={false}
              maxSize={800000000}>
              {({ getRootProps, getInputProps }) => (
                  <div style={{ width: '300px', height: '240px', border: '1px solid lightgray', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      {...getRootProps()}
                  >
                      <input {...getInputProps()} />
                      <Icon type="plus" style={{ fontSize: '3rem' }} />

                  </div>
              )}
          </Dropzone>
          {/* Thumbnail */}
          <div>
            {ThumbnailPath && <img src={`http://localhost:5000/${ThumbnailPath}`} alt="Thumbnail"></img> }
          </div>

          <p>
            <label>Title</label>
            <Input onChange={onChangeTitle} value={VideoTitle}></Input>
          </p>

          <p>
            <label>Description</label>
            <TextArea onChange={onChangeDesc} value={Description}>

            </TextArea>
          </p>

          <p>
            <select onChange={onPrivateChange}>
              {/* <option key="" value=""></option> */}
              {PrivateOptions.map( (item,idx) => (<option key={idx} value={item.value}>{item.label}</option>))}
            </select>
          </p>
          <p>
            <select onChange={onCategoryChange}>
            {/* <option key="" value=""></option> */}
            {CategoryOptions.map( (item,idx) => (<option key={idx} value={item.value}>{item.label}</option>))}
            </select>
          </p>

          <Button type="primary" size="large" onClick={onSubmit}>Submit</Button>

        </div>
      </Form>
    </div>
  )
}

export default VideoUploadPage