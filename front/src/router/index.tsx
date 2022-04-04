
import { lazy } from "react";
import { useRoutes } from "react-router-dom";
import PerfLayout from "../componnent/Layout";
const Graphs = lazy(()=> import('../pages/graphs'));
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
        element: <>compare</>
      }
      ,
      {
        path: 'status',
        element: <>status</>
      }
    ]
	},
]

export const AppRouters = () => useRoutes(allRouter);