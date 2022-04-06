
import { lazy } from "react";
import { useRoutes } from "react-router-dom";
import PerfLayout from "../componnent/Layout";
const Graphs = lazy(()=> import('../pages/graphs'));
const Compare = lazy(()=> import('../pages/compare'));
const Status = lazy(()=> import('../pages/status'));
interface IRouteObject {
  children?: IRouteObject[];
  element?: React.ReactNode;
  index?: boolean;
  path?: string;
  to?: string;
  label?: string;
  isShow?: boolean;
  icon?: React.ReactNode;
}
export const allRouter: IRouteObject[] = [
  {
		path: '/',
		element: <PerfLayout></PerfLayout>,
    children: [
      {
        path: '',
        element: <Graphs />
      },
      {
        path: 'compare',
        element: <Compare></Compare>
      }
      ,
      {
        path: 'status',
        element: <Status></Status>
      }
    ]
	},
]

export const AppRouters = () => useRoutes(allRouter);