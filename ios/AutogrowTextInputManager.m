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
#else
#import "RCTTextView.h"
#endif

#import <objc/runtime.h>

@interface RCTTextView(SetTextNotifyChange)
@end

@implementation RCTTextView(SetTextNotifyChange)
- (void)my_setText:(NSString *)text
{
  [self my_setText:text];
  
  UITextView *textView = [self valueForKey:@"_textView"];
  if (textView != nil && [self respondsToSelector:@selector(textViewDidChange:)])
  {
    dispatch_async(dispatch_get_main_queue(), ^{
      [self textViewDidChange:textView];
    });
  }
}
@end

@implementation AutoGrowTextInputManager

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(setupNotifyChangeOnSetText)
{
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    Class class = [RCTTextView class];
    method_exchangeImplementations(class_getInstanceMethod(class, @selector(setText:)), class_getInstanceMethod(class, @selector(my_setText:)));
  });
}

@end
