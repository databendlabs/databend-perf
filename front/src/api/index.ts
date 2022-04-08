import service from "../service";

export function getCategories(): Promise<any> {
	return service.get('/index.json');
}
export function getApiListByCategory(category: string): Promise<any> {
	return service.get(`${category}/${category}.json`);
}
export function getGraph(category: string, which: string): Promise<any> {
	return service.get(`${category}/${which}`);
}
export function getLatestByCategory(category:string): Promise<any>  {
  return service.get(`${category}/latest.json`);
}