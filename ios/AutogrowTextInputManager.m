//
//  AutogrowTextInputManager.m
//  example
//
//  Created by Artal Druk on 05/05/2016.
//  Copyright © 2016 Wix.com. All rights reserved.
//

#import "AutogrowTextInputManager.h"

#if __has_include(<React/RCTTextView.h>)
#import <React/RCTTextView.h>
#import <React/RCTUIManager.h>
#import <React/RCTScrollView.h>
#else
#import "RCTTextView.h"
#import "RCTUIManager.h"
#import "RCTScrollView.h"
#endif

#import <objc/runtime.h>

NSUInteger const kMaxDeferedGetScrollView = 15;

@interface RCTTextView(SetTextNotifyChange)
@end

@implementation RCTTextView(SetTextNotifyChange)
- (void)my_setText:(NSString *)text
{
  [self my_setText:text];
  
  UITextView *textView = [self valueForKey:@"_textView"];
  if (textView != nil && [self respondsToSelector:@selector(textViewDidChange:)])
  {
    // dispatch_async(dispatch_get_main_queue(), ^{
      // [self textViewDidChange:textView];
    // });
  }
}
@end

@interface AutoGrowTextInputManager ()
{
    NSMapTable *_inputToScrollViews;
    NSUInteger _deferedInitializeAccessoryViewsCount;
}
@end

@implementation AutoGrowTextInputManager

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE();

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}


#pragma mark - public API


RCT_EXPORT_METHOD(setupNotifyChangeOnSetText)
{
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    Class class = [RCTTextView class];
    method_exchangeImplementations(class_getInstanceMethod(class, @selector(setText:)), class_getInstanceMethod(class, @selector(my_setText:)));
  });
}

RCT_EXPORT_METHOD(applySettingsForInput:(nonnull NSNumber *)textInputReactTag settings:(NSDictionary*)settings)
{
    UITextView *uiTextView = [self getTextViewForInput:textInputReactTag];
    if (uiTextView != nil)
    {
        if([settings[@"disableScrollAndBounce"] boolValue])
        {
            uiTextView.scrollEnabled = NO;
            uiTextView.bounces = NO;
        }
        
        if([settings[@"enableScrollToCaret"] boolValue])
        {
            _deferedInitializeAccessoryViewsCount = 0;
            
            dispatch_async(dispatch_get_main_queue(), ^{
                dispatch_async(dispatch_get_main_queue(), ^{
                    [self getScrollViewContainerForTextView:uiTextView completion:^(UIScrollView* scrollView)
                    {
                        if(scrollView != nil)
                        {
                            [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onTextViewDidChangeNotification:) name:UITextViewTextDidChangeNotification object:uiTextView];
                            
                            if(_inputToScrollViews == nil)
                            {
                                _inputToScrollViews = [NSMapTable weakToWeakObjectsMapTable];
                            }
                            [_inputToScrollViews setObject:scrollView forKey:uiTextView];
                        }
                    }];
                });
            });
        }
    }
}

RCT_EXPORT_METHOD(performCleanupForInput:(nonnull NSNumber *)textInputReactTag)
{
    UITextView *uiTextView = [self getTextViewForInput:textInputReactTag];
    if (uiTextView != nil)
    {
        [[NSNotificationCenter defaultCenter] removeObserver:uiTextView];
    }
}

#pragma mark - utility methods

-(UITextView*)getTextViewForInput:(nonnull NSNumber *)textInputReactTag
{
    UIView *_textView = [self.bridge.uiManager viewForReactTag:textInputReactTag];
    if ([_textView isKindOfClass:[RCTTextView class]])
    {
        RCTTextView *textView = (RCTTextView *)_textView;
        UITextView *uiTextView = [textView valueForKey:@"_textView"];
        return uiTextView;
    }
    return nil;
}

-(UIScrollView*)getScrollContainerForTextView:(UITextView*)textView
{
    UIView *view = textView;
    while (view.superview != nil)
    {
        view = view.superview;
        if ([view isKindOfClass:[RCTScrollView class]])
            break;
    }
    
    if ([view isKindOfClass:[RCTScrollView class]])
    {
        RCTScrollView *rctScrollView = (RCTScrollView *)view;
        UIScrollView *scrollView = [rctScrollView valueForKey:@"_scrollView"];
        return scrollView;
    }
    return nil;
}

-(void) getScrollViewContainerForTextView:(UITextView*)textView completion:(void (^ __nullable)(UIScrollView* scrollView))completion
{
    if (_deferedInitializeAccessoryViewsCount < kMaxDeferedGetScrollView)
    {
        _deferedInitializeAccessoryViewsCount++;
        
        UIScrollView *scrollView = [self getScrollContainerForTextView:textView];
        if(scrollView != nil)
        {
            completion(scrollView);
        }
        else
        {
            dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.1 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
               [self getScrollViewContainerForTextView:textView completion:completion];
            });
        }
    }
    else
    {
        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.1 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
            UIScrollView *scrollView = [self getScrollContainerForTextView:textView];
            completion(scrollView);
        });
    }
}

-(void)onTextViewDidChangeNotification:(NSNotification *)notif
{
    UITextView *textView = notif.object;
    UIScrollView *scrollView = [_inputToScrollViews objectForKey:textView];
    if(scrollView != nil)
    {
        CGRect caretRect = [textView caretRectForPosition:textView.selectedTextRange.end];
        if(caretRect.size.width > 0 && caretRect.size.height > 0)
        {
            caretRect = [scrollView convertRect:caretRect fromView:textView];
            
            CGRect visibleRect = CGRectMake(0, scrollView.contentOffset.y, scrollView.frame.size.width, scrollView.frame.size.height - scrollView.contentInset.bottom);
            if (!CGRectIntersectsRect(visibleRect, caretRect))
            {
                BOOL caretIsAboveVisibleRect = caretRect.origin.y + caretRect.size.height < visibleRect.origin.y;
                CGFloat yOffset = caretIsAboveVisibleRect ? caretRect.origin.y - 3 : caretRect.origin.y - visibleRect.size.height + caretRect.size.height + 3;
                [scrollView setContentOffset:CGPointMake(scrollView.contentOffset.x, yOffset) animated:NO];
            }
        }
        else
        {
            dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.1 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                [self onTextViewDidChangeNotification:notif];
            });
        }
    }
}

@end
