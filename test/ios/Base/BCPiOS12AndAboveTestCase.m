// Copyright © 2018-2023 Kaleyra S.p.a. All Rights Reserved.
// See LICENSE for licensing information

#import "BCPiOS12AndAboveTestCase.h"

@implementation BCPiOS12AndAboveTestCase

+ (instancetype)testCaseWithSelector:(SEL)selector
{
    if (@available(iOS 12.0, *))
    {
        return [super testCaseWithSelector:selector];
    } else
    {
        return nil;
    }
}

+ (instancetype)testCaseWithInvocation:(NSInvocation *)invocation
{
    if (@available(iOS 12.0, *))
    {
        return [super testCaseWithInvocation:invocation];
    } else
    {
        return nil;
    }
}

@end
