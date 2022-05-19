import { FC, ReactElement } from 'react';
import styles from './footer.module.scss';
import LinkIcon from '../../assets/icon/link';
const Footer: FC = (): ReactElement=> {
  const links: {
    title: string;
    list: {
      name: string; 
      link:string;
      linkIcon?:boolean
    }[];
  }[] = [
    {
      title: 'About',
      list: [
        {
          name: 'What is Databend?',
          link: 'https://databend.rs/doc'
        },
        {
          name: 'Performance',
          link: 'https://databend.rs/doc/performance'
        }
      ]
    },
    {
      title: 'Resources',
      list: [
        {
          name: 'Deployment',
          link: 'https://databend.rs/doc/deploy'
        },
        {
          name: 'Develop',
          link: 'https://databend.rs/doc/develop'
        }
      ]
    },
    {
      title: 'Community',
      list: [
        {
          name: 'Slack',
          linkIcon: true,
          link: 'https://link.databend.rs/join-slack'
        },
        {
          name: 'Twitter',
          linkIcon: true,
          link: 'https://twitter.com/Datafuse_Labs'
        }
      ]
    },
    {
      title: 'More',
      list: [
        {
          name: 'Weekly',
          linkIcon: true,
          link: 'https://weekly.databend.rs/'
        },
        {
          name: 'GitHub',
          linkIcon: true,
          link: 'https://github.com/datafuselabs/databend'
        }
      ]
    }
  ]
  return (
    <div className={styles.footer}>
      <div className={styles.links}>
        {
          links?.map((item, i)=>{
            return  <div className={styles.item} key={i}>
                      <div className={styles.title}>{item.title}</div>
                      <div>
                        {
                          item.list.map((item, index)=>{
                            return <div key={index} className={styles.itemLink}>
                                    <a target={"_blank"} href={item.link}>{item.name} {item?.linkIcon ? <LinkIcon></LinkIcon>: ''}</a>
                                  </div>
                          })
                        }
                      </div>
                    </div>
          })
         
        }
      </div>
      <div className={styles.copyright}>
        Copyright © {new Date().getFullYear()} Datafuse Labs, Inc.
      </div>
      <img style={{display: 'block',margin: '30px auto'}} src="https://www.datocms-assets.com/31049/1618983297-powered-by-vercel.svg"/>
    </div>
  );
};
export default Footer;