import { Level } from '../types/game';

export const levels: Level[] = [
  {
    id: 'vaccine',
    name: '疫苗配送任务',
    description: '将一批新冠疫苗从配送中心运往社区接种点，温度要求严格控制在2-8℃。任何温度超标都可能导致疫苗失效，造成重大损失。',
    icon: '💉',
    difficulty: 'hard',
    targetTemp: { min: 2, max: 8 },
    initialTemp: 5,
    scenes: [
      {
        id: 'loading',
        name: '装车前检查',
        icon: '📦',
        description: '你来到配送中心冷库，准备装车。请仔细检查每一个环节，确保疫苗安全起运。',
        decisions: [
          {
            id: 'v-zone-select',
            question: '根据疫苗包装箱上的温度标签"2-8℃冷藏"，你应该将货物装入哪个温区？',
            description: '配送车辆有三个独立温区，分别控制不同的温度范围。',
            options: [
              {
                id: 'a',
                text: '冷冻区（-18℃以下）',
                isCorrect: false,
                consequence: {
                  complianceScore: -20,
                  damageRisk: 25,
                  complaintRisk: 10,
                  temperatureChange: -10,
                  feedback: '❌ 错误！疫苗会被冻坏的！',
                  explanation: '疫苗是生物制品，冻结会破坏其蛋白质结构，导致疫苗完全失效。2-8℃是冷藏温度，不是冷冻温度。正确的做法是选择冷藏区。'
                }
              },
              {
                id: 'b',
                text: '冷藏区（2-8℃）',
                isCorrect: true,
                consequence: {
                  complianceScore: 0,
                  damageRisk: 0,
                  complaintRisk: 0,
                  temperatureChange: 0,
                  feedback: '✅ 正确！选择了合适的温区。',
                  explanation: '疫苗要求2-8℃冷藏保存，选择冷藏区是正确的。温度过高会导致疫苗活性下降，温度过低则会冻坏疫苗。'
                }
              },
              {
                id: 'c',
                text: '恒温区（15-25℃）',
                isCorrect: false,
                consequence: {
                  complianceScore: -15,
                  damageRisk: 20,
                  complaintRisk: 15,
                  temperatureChange: 12,
                  feedback: '❌ 错误！温度太高了，疫苗会失效！',
                  explanation: '15-25℃的温度远高于疫苗的保存要求，会导致疫苗中的有效成分快速降解，在到达目的地前就可能失效。'
                }
              }
            ]
          },
          {
            id: 'v-precool-check',
            question: '冷藏区当前显示温度为12℃，调度员催促你赶紧装车，说路上开制冷就行。你怎么办？',
            description: '车辆制冷系统显示正在降温，但还没有达到目标温度。',
            options: [
              {
                id: 'a',
                text: '听从调度，立即装车，路上降温',
                isCorrect: false,
                consequence: {
                  complianceScore: -15,
                  damageRisk: 15,
                  complaintRisk: 5,
                  temperatureChange: 5,
                  feedback: '❌ 错误！货物在高温下暴露的每一分钟都有风险。',
                  explanation: '疫苗装车时必须确保车厢已经预冷到规定温度。如果在12℃时装车，疫苗会在较高温度下放置一段时间，加上装车过程中的温度波动，很容易超过8℃的上限。正确做法是等待预冷到位。'
                }
              },
              {
                id: 'b',
                text: '耐心等待，直到温度降到8℃以下再装车',
                isCorrect: true,
                consequence: {
                  complianceScore: 0,
                  damageRisk: 0,
                  complaintRisk: 0,
                  temperatureChange: -5,
                  feedback: '✅ 正确！坚持原则，保证疫苗质量。',
                  explanation: '《药品经营质量管理规范》明确要求，冷藏药品装车前必须检查并确认车厢温度符合要求。等待预冷到位虽然会耽误一点时间，但确保了疫苗的质量安全。'
                }
              },
              {
                id: 'c',
                text: '边装车边等降温，两边不耽误',
                isCorrect: false,
                consequence: {
                  complianceScore: -10,
                  damageRisk: 10,
                  complaintRisk: 5,
                  temperatureChange: 2,
                  feedback: '❌ 这样做有风险！',
                  explanation: '边装车边降温会导致货物温度波动，而且装车过程中车门打开，冷气外泄，降温速度会更慢。应该等温度达标后，快速完成装车。'
                }
              }
            ]
          },
          {
            id: 'v-probe-check',
            question: '装车前要检查温度探头位置，你认为探头应该放在哪里？',
            description: '温度探头是实时监控货厢温度的重要设备，位置不当会导致温度数据失真。',
            options: [
              {
                id: 'a',
                text: '放在回风口处，那里温度最低',
                isCorrect: false,
                consequence: {
                  complianceScore: -10,
                  damageRisk: 15,
                  complaintRisk: 5,
                  temperatureChange: 0,
                  feedback: '❌ 错误！这是最冷的地方，不能代表货物温度。',
                  explanation: '回风口是制冷系统吸入空气的地方，温度确实最低，但不能代表货物的真实温度。如果只监控回风口温度，可能货物实际已经超标了还不知道。'
                }
              },
              {
                id: 'b',
                text: '放在出风口处，对着冷风吹',
                isCorrect: false,
                consequence: {
                  complianceScore: -8,
                  damageRisk: 10,
                  complaintRisk: 5,
                  temperatureChange: 0,
                  feedback: '❌ 错误！这里温度最低，同样不具代表性。',
                  explanation: '出风口直接吹冷风，温度会低于货物实际温度。如果以这个位置的温度为准，会误以为温度足够低，但货物可能已经超标。'
                }
              },
              {
                id: 'c',
                text: '放在货物中间，与货物同温层',
                isCorrect: true,
                consequence: {
                  complianceScore: 0,
                  damageRisk: 0,
                  complaintRisk: 0,
                  temperatureChange: 0,
                  feedback: '✅ 正确！这样才能真实反映货物温度。',
                  explanation: '温度探头应该放置在最能代表货物温度的位置，通常是货物堆码的几何中心。这样才能真实反映疫苗的实际温度，及时发现温度异常。同时还要留一个备用探头，以防主探头故障。'
                }
              }
            ]
          }
        ]
      },
      {
        id: 'transit',
        name: '途中行驶',
        icon: '🚚',
        description: '车辆已经出发，行驶在前往接种点的路上。注意观察温度变化，随时应对突发情况。',
        decisions: [
          {
            id: 'v-traffic-jam',
            question: '行驶到一半遇到严重堵车，预计要堵1小时以上。车内温度开始缓慢上升，你怎么办？',
            description: '车外温度32℃，制冷系统一直在工作，但堵车时车速慢，散热效果下降。',
            timeLimit: 30,
            options: [
              {
                id: 'a',
                text: '熄火等待，节省燃油，反正有制冷机组',
                isCorrect: false,
                consequence: {
                  complianceScore: -12,
                  damageRisk: 18,
                  complaintRisk: 8,
                  temperatureChange: 4,
                  feedback: '❌ 错误！熄火后制冷系统可能无法正常工作！',
                  explanation: '很多独立制冷机组需要车辆发动机提供动力。如果熄火，制冷系统停止工作，温度会快速上升。即使是独立机组，长时间不启动车辆也可能导致电池电量不足。'
                }
              },
              {
                id: 'b',
                text: '保持车辆怠速，确保制冷系统正常运行',
                isCorrect: true,
                consequence: {
                  complianceScore: 0,
                  damageRisk: 0,
                  complaintRisk: 0,
                  temperatureChange: 0,
                  feedback: '✅ 正确！确保冷链不中断。',
                  explanation: '堵车时保持车辆怠速可以确保制冷系统持续工作，维持货厢温度。虽然会多消耗一些燃油，但与疫苗失效的损失相比，这点成本是值得的。同时可以联系调度说明情况。'
                }
              },
              {
                id: 'c',
                text: '每隔10分钟启动5分钟，折中处理',
                isCorrect: false,
                consequence: {
                  complianceScore: -8,
                  damageRisk: 12,
                  complaintRisk: 5,
                  temperatureChange: 2,
                  feedback: '❌ 这样会导致温度波动！',
                  explanation: '频繁启停制冷系统会导致货厢温度波动，每次停止时温度都会上升。对于温度敏感的疫苗来说，这种温度波动可能累积造成质量问题。应该持续运行制冷系统。'
                }
              }
            ]
          },
          {
            id: 'v-door-alarm',
            question: '行驶中突然听到车厢门未关严的警报声，温度显示开始快速上升。你怎么办？',
            description: '车速60km/h，旁边是快速车道，后方有车跟随。',
            timeLimit: 20,
            options: [
              {
                id: 'a',
                text: '立即在行车道上停车检查',
                isCorrect: false,
                consequence: {
                  complianceScore: -5,
                  damageRisk: 5,
                  complaintRisk: 15,
                  temperatureChange: 3,
                  feedback: '❌ 太危险了！容易发生交通事故！',
                  explanation: '在快速路上突然停车非常危险，容易造成追尾事故。安全第一，应该先观察后视镜，打开双闪，缓慢行驶到安全区域再停车检查。'
                }
              },
              {
                id: 'b',
                text: '先打开双闪，观察后视镜，开到安全地带再停车检查',
                isCorrect: true,
                consequence: {
                  complianceScore: 0,
                  damageRisk: 5,
                  complaintRisk: 0,
                  temperatureChange: 2,
                  feedback: '✅ 正确！在确保安全的前提下处理问题。',
                  explanation: '安全驾驶永远是第一位的。正确做法是：1. 打开双闪警示后车；2. 观察后视镜，确认安全；3. 缓慢变道到应急车道或驶离主干道；4. 停车后设置三角警示牌；5. 检查并关严车厢门。虽然温度会上升一点，但保证了行车安全。'
                }
              },
              {
                id: 'c',
                text: '继续开到目的地再说，应该问题不大',
                isCorrect: false,
                consequence: {
                  complianceScore: -20,
                  damageRisk: 25,
                  complaintRisk: 15,
                  temperatureChange: 8,
                  feedback: '❌ 大错特错！车厢门没关严会导致冷气大量外泄！',
                  explanation: '车厢门未关严会导致冷气大量外泄，温度会在短时间内快速上升，疫苗很可能全部失效。这是严重的工作失职。发现问题必须及时处理，不能心存侥幸。'
                }
              }
            ]
          }
        ]
      },
      {
        id: 'delivery',
        name: '门店交接',
        icon: '🤝',
        description: '你已经到达社区接种点。现在需要完成卸货、验温和签收工作，注意保留好所有证据。',
        decisions: [
          {
            id: 'v-unload-temp',
            question: '卸货前需要记录温度，你应该记录哪个温度？',
            description: '接种点的收货人员要求提供温度记录，作为疫苗质量合格的证据。',
            options: [
              {
                id: 'a',
                text: '查看温控记录仪，记录运输全程的温度数据',
                isCorrect: true,
                consequence: {
                  complianceScore: 0,
                  damageRisk: 0,
                  complaintRisk: 0,
                  temperatureChange: 0,
                  feedback: '✅ 正确！完整的温度记录是质量凭证。',
                  explanation: '根据《药品经营质量管理规范》，冷藏药品运输必须有完整的温度记录。温控记录仪可以提供全程温度数据，是证明疫苗在运输过程中温度合格的重要凭证。需要打印或导出温度记录交给收货方。'
                }
              },
              {
                id: 'b',
                text: '看一下仪表盘上的当前温度，告诉对方就行',
                isCorrect: false,
                consequence: {
                  complianceScore: -10,
                  damageRisk: 5,
                  complaintRisk: 10,
                  temperatureChange: 0,
                  feedback: '❌ 不够规范！需要完整的温度记录。',
                  explanation: '只提供当前温度是不够的，收货方需要确认整个运输过程中温度都符合要求。如果没有完整的温度记录，对方有权拒收货物。'
                }
              },
              {
                id: 'c',
                text: '口头保证温度没问题，让对方赶紧收货',
                isCorrect: false,
                consequence: {
                  complianceScore: -15,
                  damageRisk: 10,
                  complaintRisk: 15,
                  temperatureChange: 0,
                  feedback: '❌ 不符合规范！可能被拒收！',
                  explanation: '疫苗是特殊药品，交接必须有规范的流程和记录。口头保证没有法律效力，一旦出现质量问题，你和公司都要承担责任。必须提供完整的温度记录。'
                }
              }
            ]
          },
          {
            id: 'v-photo-evidence',
            question: '卸货时发现有一箱疫苗的外包装有点挤压变形，你怎么办？',
            description: '箱子外观有轻微凹陷，但内部疫苗看起来完好，温度显示正常。',
            options: [
              {
                id: 'a',
                text: '拍照留证，记录情况，让收货方签字确认',
                isCorrect: true,
                consequence: {
                  complianceScore: 0,
                  damageRisk: 0,
                  complaintRisk: 0,
                  temperatureChange: 0,
                  feedback: '✅ 正确！保留证据，明确责任。',
                  explanation: '正确做法是：1. 拍照留证，包括外包装、快递面单、温度显示；2. 在送货单上注明外包装情况；3. 让收货方签字确认；4. 向公司汇报。这样可以明确责任划分，避免后续纠纷。'
                }
              },
              {
                id: 'b',
                text: '偷偷放在最下面，希望对方没发现',
                isCorrect: false,
                consequence: {
                  complianceScore: -15,
                  damageRisk: 10,
                  complaintRisk: 20,
                  temperatureChange: 0,
                  feedback: '❌ 错误！这是不负责任的行为！',
                  explanation: '隐瞒问题是非常错误的。如果后续对方发现并投诉，你和公司将承担全部责任，还会被认为不诚信。外包装变形可能影响内部疫苗的质量，必须如实告知并记录。'
                }
              },
              {
                id: 'c',
                text: '直接拒收，拉回公司',
                isCorrect: false,
                consequence: {
                  complianceScore: -5,
                  damageRisk: 5,
                  complaintRisk: 15,
                  temperatureChange: 0,
                  feedback: '❌ 过于极端！先检查再决定。',
                  explanation: '外包装轻微变形不一定影响内部疫苗质量。应该先检查内部疫苗是否完好，温度是否正常，然后拍照记录，让收货方决定是否拒收。司机没有权限直接决定拒收。'
                }
              }
            ]
          },
          {
            id: 'v-sign-dispute',
            question: '收货人员说温度记录中有一次瞬时温度达到8.2℃，超出了0.2℃，拒绝签收。你怎么办？',
            description: '温度记录显示只有一次持续2分钟的8.2℃，其余时间都在2-8℃范围内。',
            options: [
              {
                id: 'a',
                text: '耐心解释，说明是开关门时的正常波动，联系调度协调',
                isCorrect: true,
                consequence: {
                  complianceScore: 0,
                  damageRisk: 0,
                  complaintRisk: 5,
                  temperatureChange: 0,
                  feedback: '✅ 正确！专业沟通，积极解决问题。',
                  explanation: '开关门时温度短暂上升是正常现象，不会影响疫苗质量。正确做法是：1. 耐心向收货方解释这是正常操作导致的短暂波动；2. 指出其余时间温度都合格；3. 联系公司质量部门与对方沟通；4. 必要时提供疫苗稳定性数据。保持专业和耐心，避免冲突。'
                }
              },
              {
                id: 'b',
                text: '和对方争吵，说对方故意刁难',
                isCorrect: false,
                consequence: {
                  complianceScore: -10,
                  damageRisk: 5,
                  complaintRisk: 25,
                  temperatureChange: 0,
                  feedback: '❌ 错误！吵架解决不了问题，只会更糟。',
                  explanation: '与收货方争吵会严重影响客户关系，而且解决不了问题。即使对方有不合理的地方，也应该通过正常渠道沟通解决，而不是情绪化对抗。这会严重影响公司声誉。'
                }
              },
              {
                id: 'c',
                text: '自认倒霉，拉回去',
                isCorrect: false,
                consequence: {
                  complianceScore: -8,
                  damageRisk: 15,
                  complaintRisk: 10,
                  temperatureChange: 0,
                  feedback: '❌ 应该积极沟通，而不是轻易放弃！',
                  explanation: '遇到争议应该积极沟通解决，而不是轻易放弃。疫苗是急需物资，拉回去会影响接种工作，也会给公司造成损失。应该先尝试沟通协调，实在不行再按公司流程处理。'
                }
              }
            ]
          }
        ]
      }
    ],
    randomEvents: [
      {
        id: 'v-random-phone',
        question: '客户打电话来催货，说接种点人很多，让你开快点。你怎么办？',
        description: '客户语气很急，说已经等了很久了。',
        timeLimit: 15,
        isRandomEvent: true,
        options: [
          {
            id: 'a',
            text: '安全第一，保持规定车速，向客户解释',
            isCorrect: true,
            consequence: {
              complianceScore: 0,
              damageRisk: 0,
              complaintRisk: 5,
              temperatureChange: 0,
              feedback: '✅ 正确！安全和质量是第一位的。',
              explanation: '超速行驶会增加交通事故风险，急加速急减速也会影响制冷系统稳定运行。应该礼貌地向客户解释，你会在确保安全和冷链质量的前提下尽快赶到。'
            }
          },
          {
            id: 'b',
            text: '超速行驶，满足客户要求',
            isCorrect: false,
            consequence: {
              complianceScore: -10,
              damageRisk: 15,
              complaintRisk: 0,
              temperatureChange: 1,
              feedback: '❌ 错误！超速会增加安全风险！',
              explanation: '超速行驶不仅违法，还大大增加了交通事故的风险。而且频繁加速减速会导致制冷系统运行不稳定，温度波动增大。安全和疫苗质量比速度更重要。'
            }
          },
          {
            id: 'c',
            text: '不接电话，专心开车',
            isCorrect: false,
            consequence: {
              complianceScore: -5,
              damageRisk: 0,
              complaintRisk: 15,
              temperatureChange: 0,
              feedback: '❌ 不接电话会让客户更着急！',
              explanation: '不接客户电话会让客户更加焦虑，甚至可能投诉。可以使用车载蓝牙或停车后回电，礼貌地与客户沟通。良好的沟通可以减少很多误解。'
            }
          }
        ]
      },
      {
        id: 'v-random-temp',
        question: '温度显示突然异常，一会儿显示0℃，一会儿显示15℃。你怎么办？',
        description: '看起来像是温度探头出了问题。',
        timeLimit: 20,
        isRandomEvent: true,
        options: [
          {
            id: 'a',
            text: '立即停车检查探头，切换备用探头，联系调度',
            isCorrect: true,
            consequence: {
              complianceScore: 0,
              damageRisk: 5,
              complaintRisk: 0,
              temperatureChange: 1,
              feedback: '✅ 正确！及时处理设备故障。',
              explanation: '温度显示异常可能是探头故障，也可能是真的温度异常。正确做法是：1. 安全停车；2. 手动检查货厢实际温度；3. 切换到备用探头；4. 联系调度和质量部门报告情况。不能依赖有问题的温度显示。'
            }
          },
          {
            id: 'b',
            text: '不管它，应该是探头坏了',
            isCorrect: false,
            consequence: {
              complianceScore: -15,
              damageRisk: 20,
              complaintRisk: 5,
              temperatureChange: 0,
              feedback: '❌ 错误！万一真的温度异常怎么办？',
              explanation: '温度显示异常时，不能想当然地认为是探头坏了。万一是真的温度异常（比如制冷系统故障），不及时处理会导致整批疫苗报废。必须停车检查确认。'
            }
          },
          {
            id: 'c',
            text: '自己用手机拍下来，继续开',
            isCorrect: false,
            consequence: {
              complianceScore: -10,
              damageRisk: 15,
              complaintRisk: 5,
              temperatureChange: 0,
              feedback: '❌ 拍照不能解决问题！',
              explanation: '拍照留证是必要的，但更重要的是查明原因并处理。如果是真的温度异常，继续行驶会导致疫苗报废。必须停车检查，必要时寻求技术支持。'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'fresh',
    name: '生鲜配送任务',
    description: '将一车新鲜蔬菜和水果从批发市场运往市区各大连锁超市。温度要求0-4℃，确保新鲜度。',
    icon: '🥬',
    difficulty: 'medium',
    targetTemp: { min: 0, max: 4 },
    initialTemp: 2,
    scenes: [
      {
        id: 'loading',
        name: '装车前检查',
        icon: '📦',
        description: '你来到农产品批发市场，准备开始装车。各种新鲜蔬菜和水果已经分拣完毕，等待装车。',
        decisions: [
          {
            id: 'f-zone-select',
            question: '这批蔬菜和水果要求0-4℃保鲜，你选择哪个温区？',
            description: '车辆有三个温区，可以分别控制不同温度。',
            options: [
              {
                id: 'a',
                text: '冷冻区（-18℃以下）',
                isCorrect: false,
                consequence: {
                  complianceScore: -15,
                  damageRisk: 25,
                  complaintRisk: 10,
                  temperatureChange: -10,
                  feedback: '❌ 错误！蔬菜水果会被冻坏！',
                  explanation: '蔬菜水果含有大量水分，冻结会破坏细胞壁，导致解冻后软烂流水，完全失去商品价值。0-4℃是保鲜温度，不是冷冻温度。'
                }
              },
              {
                id: 'b',
                text: '冷藏区（0-4℃）',
                isCorrect: true,
                consequence: {
                  complianceScore: 0,
                  damageRisk: 0,
                  complaintRisk: 0,
                  temperatureChange: 0,
                  feedback: '✅ 正确！选择了合适的保鲜温度。',
                  explanation: '大多数新鲜蔬菜和水果的最佳保鲜温度是0-4℃。这个温度既能抑制微生物生长，又不会冻坏果蔬，还能减缓呼吸作用，延长保鲜期。'
                }
              },
              {
                id: 'c',
                text: '恒温区（15-25℃）',
                isCorrect: false,
                consequence: {
                  complianceScore: -12,
                  damageRisk: 20,
                  complaintRisk: 15,
                  temperatureChange: 15,
                  feedback: '❌ 错误！温度太高，果蔬很快就会变质！',
                  explanation: '15-25℃下，微生物繁殖很快，果蔬的呼吸作用也很强，几个小时就可能开始变质。夏天甚至可能在运输途中就腐烂了。'
                }
              }
            ]
          },
          {
            id: 'f-precool',
            question: '现在是夏天，车厢经过暴晒，内部温度有38℃。装车工说直接装吧，开空调很快就凉了。你怎么办？',
            description: '地面温度接近40℃，车厢摸起来烫手。',
            options: [
              {
                id: 'a',
                text: '打开制冷系统强力预冷，降到4℃以下再装车',
                isCorrect: true,
                consequence: {
                  complianceScore: 0,
                  damageRisk: 0,
                  complaintRisk: 0,
                  temperatureChange: -35,
                  feedback: '✅ 正确！确保车厢温度达标。',
                  explanation: '夏天经过暴晒的车厢温度很高，如果直接装货，果蔬会被"烤"坏，制冷系统也需要很长时间才能把温度降下来。正确做法是先打开车门通风，然后开制冷系统预冷，等温度降到4℃以下再快速装车。'
                }
              },
              {
                id: 'b',
                text: '听从装车工建议，直接装车',
                isCorrect: false,
                consequence: {
                  complianceScore: -15,
                  damageRisk: 20,
                  complaintRisk: 10,
                  temperatureChange: 10,
                  feedback: '❌ 错误！高温会损伤果蔬！',
                  explanation: '38℃的高温环境会直接损伤果蔬，产生"田间热"，加速变质。即使后续降温，已经造成的损伤也无法逆转。必须预冷到位才能装车。'
                }
              },
              {
                id: 'c',
                text: '先装货，边装边开空调',
                isCorrect: false,
                consequence: {
                  complianceScore: -10,
                  damageRisk: 15,
                  complaintRisk: 5,
                  temperatureChange: 5,
                  feedback: '❌ 这样降温太慢了！',
                  explanation: '装车时车门大开，冷气外泄严重，降温速度会非常慢。果蔬会长时间处于高温环境中，新鲜度会大大下降。应该先预冷，再快速装车。'
                }
              }
            ]
          },
          {
            id: 'f-sort-check',
            question: '装车时发现有几箱草莓已经有点发软，表面还有轻微霉点。装车工说没事，凑一车吧。你怎么办？',
            description: '这几箱草莓看起来放了几天，不如其他的新鲜。',
            options: [
              {
                id: 'a',
                text: '坚决挑出来，不能装车，向现场负责人汇报',
                isCorrect: true,
                consequence: {
                  complianceScore: 0,
                  damageRisk: 0,
                  complaintRisk: 0,
                  temperatureChange: 0,
                  feedback: '✅ 正确！保证货物质量是司机的责任。',
                  explanation: '已经开始变质的草莓决不能装车。一是会在运输过程中继续腐烂，二是会释放乙烯气体，加速其他果蔬的成熟和变质。司机有责任检查货物质量，拒收不合格的货物。'
                }
              },
              {
                id: 'b',
                text: '多一事不如少一事，装上去吧',
                isCorrect: false,
                consequence: {
                  complianceScore: -15,
                  damageRisk: 25,
                  complaintRisk: 20,
                  temperatureChange: 0,
                  feedback: '❌ 错误！这是不负责任的表现！',
                  explanation: '装不合格的货物会导致整批货物质量下降，到了超市肯定会被拒收，还可能收到客户投诉。更严重的是，变质的草莓可能污染其他货物，造成更大损失。'
                }
              },
              {
                id: 'c',
                text: '把这几箱放在最上面，到了先卸',
                isCorrect: false,
                consequence: {
                  complianceScore: -10,
                  damageRisk: 18,
                  complaintRisk: 10,
                  temperatureChange: 0,
                  feedback: '❌ 这样不行，问题还是存在！',
                  explanation: '放在哪里都改变不了草莓已经变质的事实，而且会影响其他货物。该拒收的必须拒收，不能抱有侥幸心理。'
                }
              }
            ]
          }
        ]
      },
      {
        id: 'transit',
        name: '途中行驶',
        icon: '🚚',
        description: '车辆已经出发，行驶在市区道路上。今天要送5家超市，注意控制好温度。',
        decisions: [
          {
            id: 'f-multi-stop',
            question: '送第一家超市时，需要打开车厢门卸货。卸完货关门后，你发现温度升到了6℃。你怎么办？',
            description: '还有4家要送，时间很紧。',
            timeLimit: 25,
            options: [
              {
                id: 'a',
                text: '等温度降到4℃以下再开往下一家',
                isCorrect: true,
                consequence: {
                  complianceScore: 0,
                  damageRisk: 0,
                  complaintRisk: 5,
                  temperatureChange: -3,
                  feedback: '✅ 正确！确保冷链不中断。',
                  explanation: '每次开关门都会导致温度上升，这是正常的。但必须等温度恢复到规定范围内再继续行驶。如果温度还没降下来就开往下一家，温度会累积升高，影响货物质量。'
                }
              },
              {
                id: 'b',
                text: '直接开往下一家，反正门已经关了',
                isCorrect: false,
                consequence: {
                  complianceScore: -10,
                  damageRisk: 15,
                  complaintRisk: 5,
                  temperatureChange: 2,
                  feedback: '❌ 错误！温度还在超标状态！',
                  explanation: '6℃已经超过了0-4℃的要求，如果不降温就继续行驶，加上下一次开门，温度会越来越高。多次配送时，每次关门后都要等温度恢复再出发。'
                }
              },
              {
                id: 'c',
                text: '把温度调到最低，快速降温',
                isCorrect: false,
                consequence: {
                  complianceScore: -8,
                  damageRisk: 10,
                  complaintRisk: 0,
                  temperatureChange: -5,
                  feedback: '❌ 温度太低可能冻坏果蔬！',
                  explanation: '把温度调到最低可能导致出风口附近的货物被冻坏。应该按照正常的设定温度运行，耐心等待温度恢复。过于心急反而可能造成新的问题。'
                }
              }
            ]
          },
          {
            id: 'f-rain',
            question: '突然下起了大雨，你发现车厢门缝有点渗水。你怎么办？',
            description: '雨很大，能见度低，路面开始积水。',
            timeLimit: 20,
            options: [
              {
                id: 'a',
                text: '找到安全地方停车，检查渗水情况，必要时用防水布遮挡',
                isCorrect: true,
                consequence: {
                  complianceScore: 0,
                  damageRisk: 5,
                  complaintRisk: 0,
                  temperatureChange: 1,
                  feedback: '✅ 正确！及时处理，避免损失扩大。',
                  explanation: '雨水渗入车厢会打湿货物，导致蔬菜水果腐烂。正确做法是：1. 安全停车；2. 检查渗水位置和严重程度；3. 用随车携带的防水布或塑料袋遮挡；4. 必要时联系公司寻求帮助；5. 记录情况并拍照。'
                }
              },
              {
                id: 'b',
                text: '继续开，这点雨没事',
                isCorrect: false,
                consequence: {
                  complianceScore: -12,
                  damageRisk: 20,
                  complaintRisk: 10,
                  temperatureChange: 2,
                  feedback: '❌ 错误！雨水会打湿货物！',
                  explanation: '雨水渗入车厢会打湿包装箱和货物，潮湿的环境会加速微生物繁殖，导致蔬菜水果腐烂发霉。看似小事，可能造成整批货物报废。'
                }
              },
              {
                id: 'c',
                text: '加速行驶，早点送完',
                isCorrect: false,
                consequence: {
                  complianceScore: -15,
                  damageRisk: 25,
                  complaintRisk: 5,
                  temperatureChange: 1,
                  feedback: '❌ 太危险了！雨天不能开快车！',
                  explanation: '雨天路滑，加速行驶非常危险，容易发生交通事故。而且开得越快，门缝渗水可能越严重。安全第一，应该减速行驶，必要时停车处理。'
                }
              }
            ]
          }
        ]
      },
      {
        id: 'delivery',
        name: '门店交接',
        icon: '🤝',
        description: '你来到最后一家超市。经过一天的配送，终于要完成任务了。',
        decisions: [
          {
            id: 'f-temp-check',
            question: '超市收货员用手持测温枪测量蔬菜表面温度，显示为5℃，说温度超标要拒收。你怎么办？',
            description: '你的车载温控记录显示全程温度都在0-4℃之间。',
            options: [
              {
                id: 'a',
                text: '解释表面温度与货厢温度的区别，出示完整的温控记录',
                isCorrect: true,
                consequence: {
                  complianceScore: 0,
                  damageRisk: 0,
                  complaintRisk: 5,
                  temperatureChange: 0,
                  feedback: '✅ 正确！用数据说话，专业沟通。',
                  explanation: '刚卸车的货物，表面温度可能因为接触外界空气而略有上升，这是正常现象。应该：1. 解释表面温度与货物内部温度的区别；2. 出示完整的车载温控记录；3. 建议对方测量货物中心温度；4. 必要时联系公司质量部门沟通。'
                }
              },
              {
                id: 'b',
                text: '和对方争论，说对方测温枪不准',
                isCorrect: false,
                consequence: {
                  complianceScore: -10,
                  damageRisk: 5,
                  complaintRisk: 20,
                  temperatureChange: 0,
                  feedback: '❌ 错误！争吵解决不了问题！',
                  explanation: '指责对方测温枪不准是不专业的表现，会激化矛盾。应该用数据和事实说话，而不是情绪化争吵。保持专业态度，耐心沟通。'
                }
              },
              {
                id: 'c',
                text: '自认倒霉，拉回去',
                isCorrect: false,
                consequence: {
                  complianceScore: -8,
                  damageRisk: 15,
                  complaintRisk: 10,
                  temperatureChange: 0,
                  feedback: '❌ 应该先沟通解释！',
                  explanation: '遇到异议应该先尝试沟通解释，出示你的温度记录。如果对方仍然拒收，再联系公司按流程处理。轻易拉回去会造成不必要的损失。'
                }
              }
            ]
          },
          {
            id: 'f-damage-check',
            question: '卸货时发现有一箱生菜的包装箱被水浸湿了，里面的菜还好。收货员要拒收这一箱。你怎么办？',
            description: '应该是之前下雨时渗水弄湿的。',
            options: [
              {
                id: 'a',
                text: '拍照留证，检查里面的菜，如果完好可以协商更换包装',
                isCorrect: true,
                consequence: {
                  complianceScore: 0,
                  damageRisk: 5,
                  complaintRisk: 5,
                  temperatureChange: 0,
                  feedback: '✅ 正确！灵活处理，减少损失。',
                  explanation: '包装箱浸湿不代表里面的菜坏了。正确做法是：1. 拍照留证；2. 打开包装检查里面的菜；3. 如果菜是好的，可以协商更换超市的备用包装箱；4. 记录情况，让收货员签字确认；5. 向公司汇报。'
                }
              },
              {
                id: 'b',
                text: '直接拉回去',
                isCorrect: false,
                consequence: {
                  complianceScore: -5,
                  damageRisk: 15,
                  complaintRisk: 5,
                  temperatureChange: 0,
                  feedback: '❌ 可以先检查一下里面的情况！',
                  explanation: '只是外包装湿了，里面的菜可能完好。直接拉回去会造成不必要的损失，下次送货还要再跑一趟。应该先检查，能处理的尽量现场处理。'
                }
              },
              {
                id: 'c',
                text: '趁对方不注意，混到其他箱子里',
                isCorrect: false,
                consequence: {
                  complianceScore: -15,
                  damageRisk: 10,
                  complaintRisk: 25,
                  temperatureChange: 0,
                  feedback: '❌ 这是不诚信的行为！',
                  explanation: '隐瞒问题是非常错误的。如果后续对方发现，不仅会投诉，还会失去客户的信任。做生意诚信最重要，有问题应该如实告知，协商解决。'
                }
              }
            ]
          }
        ]
      }
    ],
    randomEvents: [
      {
        id: 'f-random-ac',
        question: '行驶中你闻到一股焦糊味，然后制冷系统报警灯亮了。你怎么办？',
        description: '看起来是制冷系统出了问题。',
        timeLimit: 15,
        isRandomEvent: true,
        options: [
          {
            id: 'a',
            text: '立即安全停车，关闭制冷系统，联系调度和维修人员',
            isCorrect: true,
            consequence: {
              complianceScore: 0,
              damageRisk: 10,
              complaintRisk: 5,
              temperatureChange: 2,
              feedback: '✅ 正确！及时处理，避免更大损失。',
              explanation: '焦糊味说明可能有电器故障，继续运行可能导致火灾。正确做法是：1. 安全停车；2. 关闭制冷系统和发动机；3. 检查是否有明火；4. 联系调度报告情况；5. 联系维修人员；6. 如果短时间修不好，联系公司安排转运。'
            }
          },
          {
            id: 'b',
            text: '继续开，送到了再说',
            isCorrect: false,
            consequence: {
              complianceScore: -20,
              damageRisk: 30,
              complaintRisk: 15,
              temperatureChange: 8,
              feedback: '❌ 太危险了！可能引发火灾！',
              explanation: '有焦糊味说明可能有电器短路或机械故障，继续行驶可能引发火灾，造成车毁人亡的严重后果。而且制冷系统坏了，温度会快速上升，货物也会变质。必须立即停车检查。'
            }
          },
          {
            id: 'c',
            text: '把空调开最大，继续行驶',
            isCorrect: false,
            consequence: {
              complianceScore: -15,
              damageRisk: 25,
              complaintRisk: 10,
              temperatureChange: 5,
              feedback: '❌ 完全错误！情况会更糟！',
              explanation: '已经报警了还继续运行，会让故障更加严重，甚至引发火灾。这是非常错误和危险的做法。必须立即停车处理。'
            }
          }
        ]
      },
      {
        id: 'f-random-traffic',
        question: '前方发生交通事故，道路完全堵死了。交警说可能要等2小时以上。你怎么办？',
        description: '外面温度35℃，太阳很大。',
        timeLimit: 20,
        isRandomEvent: true,
        options: [
          {
            id: 'a',
            text: '保持车辆怠速运行，确保制冷系统工作，联系调度说明情况',
            isCorrect: true,
            consequence: {
              complianceScore: 0,
              damageRisk: 5,
              complaintRisk: 5,
              temperatureChange: 1,
              feedback: '✅ 正确！确保冷链不中断。',
              explanation: '长时间堵车时，保持车辆怠速可以确保制冷系统持续工作。同时应该：1. 联系调度，说明预计延误时间；2. 联系后续送货的超市，告知可能延误；3. 密切关注温度变化；4. 如果预计堵车时间太长，可以考虑申请绕行或转运。'
            }
          },
          {
            id: 'b',
            text: '熄火等待，节约油钱',
            isCorrect: false,
            consequence: {
              complianceScore: -15,
              damageRisk: 25,
              complaintRisk: 10,
              temperatureChange: 6,
              feedback: '❌ 错误！熄火后温度会快速上升！',
              explanation: '熄火后制冷系统停止工作，在35℃的高温下，货厢温度会快速上升。2小时的时间，温度可能升到20℃以上，蔬菜水果会严重变质。与货物损失相比，油钱根本不算什么。'
            }
          },
          {
            id: 'c',
            text: '掉头逆行，绕路走',
            isCorrect: false,
            consequence: {
              complianceScore: -10,
              damageRisk: 15,
              complaintRisk: 10,
              temperatureChange: 2,
              feedback: '❌ 太危险了！逆行违法！',
              explanation: '逆行是严重的交通违法行为，非常危险，可能造成新的交通事故。而且被交警抓到会扣分罚款。应该耐心等待，或者在交警指挥下绕行。'
            }
          }
        ]
      }
    ]
  }
];

export const getLevelById = (id: string): Level | undefined => {
  return levels.find(level => level.id === id);
};

export const getDifficultyLabel = (difficulty: string): string => {
  const labels: Record<string, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  };
  return labels[difficulty] || difficulty;
};

export const getDifficultyColor = (difficulty: string): string => {
  const colors: Record<string, string> = {
    easy: 'text-green-500',
    medium: 'text-yellow-500',
    hard: 'text-red-500'
  };
  return colors[difficulty] || 'text-gray-500';
};
