import React, { useState, useEffect } from 'react';
import { Row, Col, List, Avatar } from 'antd';
import Axios from 'axios';
import SideVideo from './Sections/SideVideo';
import Subscribe from './Sections/Subscribe';
import Comment from './Sections/Comment';
import LikeDislikes from './Sections/LikeDislikes'

function VideoDetailPage(props) {

    const _videoId = props.match.params.videoId;
    const videoVariable = { videoId: _videoId }

    const[VideoDetail, setVideoDetail] = useState([]);
    const [CommentLists, setCommentLists] = useState([])

    useEffect( () => {
        Axios.post('/api/video/getVideoDetail', videoVariable)
            .then(response => {
                if (response.data.success) {
                    console.log(response.data.videoDetail);
                    setVideoDetail(response.data.videoDetail)
                }
                else{
                    alert('Failed to get video Info')
                }
            })
        Axios.post('/api/comment/getComments', videoVariable)
        .then(response => {
            if(response.data.success) {
                console.log(response.data.comments)
                setCommentLists(response.data.comments)
            }
            else{
                alert('Failed to get video Info')
            }
        })
    }
    ,[])

    const refreshFunction = (newComments) => {
        setCommentLists(CommentLists.concat(newComments))
    }

    if (VideoDetail.writer) {

        //업로드한 사용자가 자기 자신을 구독할 수 없도록.
        const subscribeBtn = VideoDetail.writer._id !== localStorage.getItem('userId') && <Subscribe userTo={VideoDetail.writer._id} userFrom={localStorage.getItem('userId')}/>

        return (
            <Row gutter={[16,16]}>
                <Col lg={18} xs={24}>
                    <div className="postPage" style={{ width: '100%', padding: '3rem 4em' }}>
                        <video style={{ width: '100%' }} src={`http://localhost:5000/${VideoDetail.filePath}`} controls></video>

                        {/* <List.Item actions={ [ <Subscribe userTo={VideoDetail.writer._id} userFrom={localStorage.getItem('userId')}/> ] }> */}
                        {/* <List.Item actions={ [ <LikeDislikes/>, subscribeBtn ] }> */}
                        <List.Item actions={ [ <LikeDislikes video userId={localStorage.getItem('userId')} videoId={_videoId}/>, <Subscribe userTo={VideoDetail.writer._id} userFrom={localStorage.getItem('userId')}/> ] }>
                            <List.Item.Meta
                                avatar={<Avatar src={VideoDetail.writer && VideoDetail.writer.image} />}
                                title={<a href="https://ant.design">{VideoDetail.title}</a>}
                                description={VideoDetail.description}
                            />
                        </List.Item>

                        {/* Comments */}
                        <Comment postId={VideoDetail._id} CommentLists={CommentLists} refreshFunction={refreshFunction}/>
                    </div>
                </Col>
                <Col lg={6} xs={24}>

                    {/* SideVideo */}
                    <SideVideo />

                </Col>
            </Row>
        )
    }
    else {
        return (
            <div>Loading...</div>
        )
    }
}

export default VideoDetailPage