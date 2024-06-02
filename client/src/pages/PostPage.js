import {useContext, useEffect, useState} from "react";
import {formatISO9075} from "date-fns";
import {Navigate, useParams} from "react-router-dom";

import {UserContext} from "../UserContext";
import {Link} from 'react-router-dom';

export default function PostPage() {
  const [postInfo,setPostInfo] = useState(null);
  const {userInfo} = useContext(UserContext);
  const [redirect,setRedirect] = useState(false);

  const {id} = useParams();
  useEffect(() => {
    fetch(`http://localhost:4000/post/${id}`)
      .then(response => {
        response.json().then(postInfo => {
          console.log(postInfo)
          setPostInfo(postInfo);
        });
      });
      
  }, []);

  async function deletePost(ev) {
    ev.preventDefault();
    const response = await fetch(`http://localhost:4000/deleteblog/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (response.ok) {
      setRedirect(true);
    }
  }

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }


  if (redirect) {
    return <Navigate to="/" />;
  }

  if (!postInfo) return '';

  return (
    <div className="post-page">
      <h1>{postInfo.title}</h1>
      <time>{formatISO9075(new Date(postInfo?.createdAt))}</time>
      <div className="author">by @{capitalizeFirstLetter(postInfo?.author?.username)}</div>
      {userInfo?.id === postInfo?.author?._id && (
        <div className="edit-row">
          <Link className="edit-btn" to={`/edit/${postInfo?._id}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
            Edit this post
          </Link>
          <Link onClick={deletePost} className="edit-btn" to={`/edit/${postInfo?._id}`}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" id="Delete"><path d="M24.2,12.193,23.8,24.3a3.988,3.988,0,0,1-4,3.857H12.2a3.988,3.988,0,0,1-4-3.853L7.8,12.193a1,1,0,0,1,2-.066l.4,12.11a2,2,0,0,0,2,1.923h7.6a2,2,0,0,0,2-1.927l.4-12.106a1,1,0,0,1,2,.066Zm1.323-4.029a1,1,0,0,1-1,1H7.478a1,1,0,0,1,0-2h3.1a1.276,1.276,0,0,0,1.273-1.148,2.991,2.991,0,0,1,2.984-2.694h2.33a2.991,2.991,0,0,1,2.984,2.694,1.276,1.276,0,0,0,1.273,1.148h3.1A1,1,0,0,1,25.522,8.164Zm-11.936-1h4.828a3.3,3.3,0,0,1-.255-.944,1,1,0,0,0-.994-.9h-2.33a1,1,0,0,0-.994.9A3.3,3.3,0,0,1,13.586,7.164Zm1.007,15.151V13.8a1,1,0,0,0-2,0v8.519a1,1,0,0,0,2,0Zm4.814,0V13.8a1,1,0,0,0-2,0v8.519a1,1,0,0,0,2,0Z" fill="#eff3f6" class="color000000 svgShape"></path></svg>
            Delete this post
          </Link>
        </div>
        
      )}
      <div className="image">
        <img src={`http://localhost:4000/${postInfo?.cover}`} alt=""/>
      </div>
      {/* <div className="content" dangerouslySetInnerHTML={{__html:postInfo.content}} >
        </div> */}
        <div className="content">
          {postInfo.summary}
        </div>
    </div>
  );
}