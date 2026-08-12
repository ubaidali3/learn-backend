//  class bna le ha jiska name ApiError ha ye class api error ko handle krne mai help kare ga


class ApiError extends Error{
  constructor(statusCode,message='Something went wrong',
    error=[],
    stack=""
  ){
    super(message)
    this.statusCode=statusCode
    this.data=null
    this.message=message
    this.success=false
    this.error=error

    if(stack){
      this.stack=stack
    }else{
      Error.captureStackTrace(this,this.constructor)
    }

  }
}

export {ApiError}