import React from 'react'
import routes from './routes'
import {Route, Switch } from "react-router-dom";
import PublicRoute from './publicRoutes';

const getRouteType=({element,type})=>{
  const routeType={
    public:<PublicRoute>{element}</PublicRoute>
  }
  return routeType[type]
}
const AppRoutes = () => {
  return (
    <Switch>
      {routes.map(({element,type,path},idx)=>{
         return (
           <Route
           path={path}
           key={idx}
           exact
           render={()=>getRouteType({element,type})}
           />
                )
      })}
    </Switch>
  )
}

export default AppRoutes