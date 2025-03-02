import LoadingOutlined from '@ant-design/icons/LoadingOutlined';
import classNames from 'classnames';
import * as React from 'react';

import { ConfigContext } from '../config-provider';
import { cloneElement } from '../_util/reactNode';
import type { TimelineItemProps } from './TimelineItem';
import TimelineItem from './TimelineItem';

// CSSINJS
import useStyle from './style';

export interface TimelineProps {
  prefixCls?: string;
  className?: string;
  rootClassName?: string;
  /** 指定最后一个幽灵节点是否存在或内容 */
  pending?: React.ReactNode;
  pendingDot?: React.ReactNode;
  style?: React.CSSProperties;
  reverse?: boolean;
  mode?: 'left' | 'alternate' | 'right';
  children?: React.ReactNode;
}

type CompoundedComponent = React.FC<TimelineProps> & {
  Item: React.FC<TimelineItemProps>;
};

const Timeline: CompoundedComponent = (props) => {
  const { getPrefixCls, direction } = React.useContext(ConfigContext);
  const {
    prefixCls: customizePrefixCls,
    pending = null,
    pendingDot,
    children,
    className,
    rootClassName,
    reverse = false,
    mode = '' as TimelineProps['mode'],
    ...restProps
  } = props;
  const prefixCls = getPrefixCls('timeline', customizePrefixCls);
  const pendingNode = typeof pending === 'boolean' ? null : pending;

  // Style
  const [wrapSSR, hashId] = useStyle(prefixCls);

  const pendingItem = pending ? (
    <TimelineItem pending={!!pending} dot={pendingDot || <LoadingOutlined />}>
      {pendingNode}
    </TimelineItem>
  ) : null;

  const timeLineItems = React.Children.toArray(children);
  timeLineItems.push(pendingItem!);
  if (reverse) {
    timeLineItems.reverse();
  }

  const getPositionCls = (ele: React.ReactElement<any>, idx: number) => {
    if (mode === 'alternate') {
      if (ele.props.position === 'right') return `${prefixCls}-item-right`;
      if (ele.props.position === 'left') return `${prefixCls}-item-left`;
      return idx % 2 === 0 ? `${prefixCls}-item-left` : `${prefixCls}-item-right`;
    }
    if (mode === 'left') return `${prefixCls}-item-left`;
    if (mode === 'right') return `${prefixCls}-item-right`;
    if (ele.props.position === 'right') return `${prefixCls}-item-right`;
    return '';
  };

  // Remove falsy items
  const truthyItems = timeLineItems.filter((item) => !!item);
  const itemsCount = React.Children.count(truthyItems);
  const lastCls = `${prefixCls}-item-last`;
  const items = React.Children.map(truthyItems, (ele: React.ReactElement<any>, idx) => {
    const pendingClass = idx === itemsCount - 2 ? lastCls : '';
    const readyClass = idx === itemsCount - 1 ? lastCls : '';
    return cloneElement(ele, {
      className: classNames([
        ele.props.className,
        !reverse && !!pending ? pendingClass : readyClass,
        getPositionCls(ele, idx),
      ]),
    });
  });

  const hasLabelItem = timeLineItems.some((item: React.ReactElement<any>) => !!item?.props?.label);

  const classString = classNames(
    prefixCls,
    {
      [`${prefixCls}-pending`]: !!pending,
      [`${prefixCls}-reverse`]: !!reverse,
      [`${prefixCls}-${mode}`]: !!mode && !hasLabelItem,
      [`${prefixCls}-label`]: hasLabelItem,
      [`${prefixCls}-rtl`]: direction === 'rtl',
    },
    className,
    rootClassName,
    hashId,
  );

  return wrapSSR(
    <ul {...restProps} className={classString}>
      {items}
    </ul>,
  );
};

Timeline.Item = TimelineItem;

if (process.env.NODE_ENV !== 'production') {
  Timeline.displayName = 'Timeline';
}

export default Timeline;
