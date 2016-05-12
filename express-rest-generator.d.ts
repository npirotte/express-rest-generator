declare module 'express-rest-generator' {
  import * as express from 'express';
  
  /**
   * Custom database error handle
   * @param {any} err - The database error
   */
  type ErrorHandler = (err: any) => void;
  /**
   * Hook executed over data before db insertion
   * @param {any} data - The incoming data from client
   * @return {any} The final data to insert in database
   */
  type beforeInsert = (data: {[id: string]: any}) => {[id: string]: any}
  /**
   * Hook executed over data before sending data to client
   * @param {any} data - The incoming data from database
   * @return {any} The final data to send to the client
   */
  type beforeSend = (data: {[id: string]: any}) => {[id: string]: any}
  
  interface IOptions extends {[id: string]: any} {
    db: any;
    error?: ErrorHandler;
    beforeInsert?: beforeInsert;
    beforeSend?: beforeSend;
  }
  
  /**
   * Generate a restfull resources
   * @param {Object} options - Configure the service. db, error, beforeInsert, beforeSend
   */
  
  export default function expressRestGenerator (options: IOptions) => express.Router;
}