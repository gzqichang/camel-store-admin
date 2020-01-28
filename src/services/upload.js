import { stringify } from 'qs';
import request from '@/utils/request';
import { getLocalStorage } from '@/utils/authority';

const imageFile = '/api/image/file/';
const imageTag = '/api/image/tag/';

export async function getImagelist(parmas){
  return request(`${imageFile}?${stringify(parmas)}`,{
    method: 'GET',
    headers:{
      'Authorization':getLocalStorage("token")
    },
  })
}

export async function createImage(parmas){
  let formData = new FormData();
  Object.keys(parmas).map(item => {
    parmas[item] && item !== 'tag' && formData.append(item, parmas[item]);
    if(parmas[item] && item === 'tag'){
      parmas[item].map(item_in => {
        formData.append('tag', item_in);
      })
    }
  })

  return request(imageFile,{
    method:'POST',
    headers:{
      'Authorization':getLocalStorage("token")
    },
    body: formData
  })
}

export async function createMoreImage(parmas) {
  let formData = new FormData();
  Object.keys(parmas).map(item => {
    parmas[item] && item !== 'tag' && formData.append(item, parmas[item]);
    if(parmas[item] && item === 'tag'){
      parmas[item].map(item_in => {
        formData.append('tag', item_in);
      })
    }
  })
  return request(`${imageFile}bulk_upload/`,{
    method:'POST',
    headers:{
      'Authorization':getLocalStorage("token")
    },
    body: formData
  })
}

export async function delMoreImage(parmas){
  return request( `${imageFile}bulk_destroy/`,{
    method:'DELETE',
    headers:{
      'Authorization':getLocalStorage("token")
    },
    body: { ...parmas }
  })
}

export async function getImageTaglist(parmas){
  return request(`${imageTag}?${stringify(parmas)}`,{
    method: 'GET',
    headers:{
      'Authorization':getLocalStorage("token")
    },
  })
}

export async function createImageTag(parmas){
  return request(imageTag,{
    method: 'POST',
    body: { ...parmas },
    headers:{
      'Authorization':getLocalStorage("token")
    },
  })
}
